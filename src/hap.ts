import { HapClient, ServiceType } from '@homebridge/hap-client';
import { ServicesTypes, Service, Characteristic } from './hap-types';
import { SmartHomeV1ExecuteResponseCommands, SmartHomeV1ExecuteRequestPayload } from 'actions-on-google';
import * as crypto from 'crypto';
import { Subject } from 'rxjs';
import { debounceTime, map } from 'rxjs/operators';

import { PluginConfig, HapInstance, Instance } from './interfaces';
import { toLongFormUUID } from './uuid';
import { Log } from './logger';

import { Door } from './types/door';
import { Fan } from './types/fan';
import { Fanv2 } from './types/fan-v2';
import { GarageDoorOpener } from './types/garage-door-opener';
import { HeaterCooler } from './types/heater-cooler';
import { HumiditySensor } from './types/humidity-sensor';
import { Lightbulb } from './types/lightbulb';
import { LockMechanism } from './types/lock-mechanism';
import { SecuritySystem } from './types/security-system';
import { Switch } from './types/switch';
import { Television } from './types/television';
import { TemperatureSensor } from './types/temperature-sensor';
import { Thermostat } from './types/thermostat';
import { Window } from './types/window';
import { WindowCovering } from './types/window-covering';

export class Hap {
  socket;
  log: Log;
  pin: string;
  config: PluginConfig;
  hapClient: HapClient;
  services: ServiceType[] = [];
  discoveryTimeout: NodeJS.Timeout;

  public ready: boolean;

  /* GSH Supported types */
  types = {
    Door: new Door(),
    Fan: new Fan(),
    Fanv2: new Fanv2(),
    GarageDoorOpener: new GarageDoorOpener(),
    HeaterCooler: new HeaterCooler(this),
    HumiditySensor: new HumiditySensor(),
    Lightbulb: new Lightbulb(),
    LockMechanism: new LockMechanism(),
    Outlet: new Switch('action.devices.types.OUTLET'),
    SecuritySystem: new SecuritySystem(),
    Switch: new Switch('action.devices.types.SWITCH'),
    Television: new Television(),
    TemperatureSensor: new TemperatureSensor(this),
    Thermostat: new Thermostat(this),
    Window: new Window(),
    WindowCovering: new WindowCovering(),
  };

  /* event tracking */
  evInstances: Instance[] = [];
  evServices: ServiceType[] = [];
  reportStateSubject = new Subject();
  pendingStateReport = [];

  /* types of characteristics to track */
  evTypes = [
    Characteristic.Active,
    Characteristic.On,
    Characteristic.CurrentPosition,
    Characteristic.TargetPosition,
    Characteristic.CurrentDoorState,
    Characteristic.TargetDoorState,
    Characteristic.Brightness,
    Characteristic.HeatingThresholdTemperature,
    Characteristic.Hue,
    Characteristic.Saturation,
    Characteristic.LockCurrentState,
    Characteristic.LockTargetState,
    Characteristic.TargetHeatingCoolingState,
    Characteristic.TargetTemperature,
    Characteristic.CoolingThresholdTemperature,
    Characteristic.CurrentTemperature,
    Characteristic.CurrentRelativeHumidity,
    Characteristic.SecuritySystemTargetState,
    Characteristic.SecuritySystemCurrentState,
  ];

  instanceBlacklist: Array<string> = [];
  accessoryFilter: Array<string> = [];
  accessorySerialFilter: Array<string> = [];
  deviceNameMap: Array<{ replace: string; with: string }> = [];

  constructor(socket, log, pin: string, config: PluginConfig) {
    this.config = config;
    this.socket = socket;
    this.log = log;
    this.pin = pin;

    this.accessoryFilter = config.accessoryFilter || [];
    this.accessorySerialFilter = config.accessorySerialFilter || [];
    this.instanceBlacklist = config.instanceBlacklist || [];

    this.log.debug('Waiting 15 seconds before starting instance discovery...');
    setTimeout(() => {
      this.discover();
    }, 1000);

    this.reportStateSubject
      .pipe(
        map((i) => {
          if (!this.pendingStateReport.includes(i)) {
            this.pendingStateReport.push(i);
          }
        }),
        debounceTime(1000),
      )
      .subscribe((data) => {
        const pendingStateReport = this.pendingStateReport;
        this.pendingStateReport = [];
        this.processPendingStateReports(pendingStateReport);
      });
  }

  /**
   * Homebridge Instance Discovery
   */

  async discover() {
    this.hapClient = new HapClient({
      config: this.config,
      pin: this.pin,
      logger: this.log,
    });

    this.waitForNoMoreDiscoveries();
    this.hapClient.on('instance-discovered', this.waitForNoMoreDiscoveries)

    this.hapClient.on('hapEvent', ((event) => {
      this.handleHapEvent(event);
    }));
  }

  waitForNoMoreDiscoveries = () => {
    // Clear any existing timeout
    if (this.discoveryTimeout) clearTimeout(this.discoveryTimeout);

    // Set up the timeout
    this.discoveryTimeout = setTimeout(() => {
      this.log.debug('No more instances discovered, publishing services');
      this.hapClient.removeListener('instance-discovered', this.waitForNoMoreDiscoveries);
      this.start();
      setTimeout(() => {
        this.requestSync();
      }, 15000);
    }, 5000);
  }

  /**
   * Start processing
   */
  async start() {
    this.services = await this.loadAccessories();
    this.log.info(`Discovered ${this.services.length} accessories`);
    this.ready = true;
    await this.buildSyncResponse();
    await this.registerCharacteristicEventHandlers();
  }

  /**
   * Build Google SYNC intent payload
   */
  async buildSyncResponse() {
    const devices = this.services.map((service) => {
      if (!this.types[service.type]) {
        // this.log.debug(`Unsupported service type ${service.type}`);
        return;
      }
      // console.log('buildSyncResponse', service);
      return this.types[service.type].sync(service);
    });
    return devices;
  }

  /**
   * Ask google to send a sync request
   */
  async requestSync() {
    this.log.info('Sending Sync Request');
    this.socket.sendJson({
      type: 'request-sync',
    });
  }

  /**
   * Process the QUERY intent
   * @param devices
   */
  async query(devices) {
    console.log('query', devices);
    const response = {};

    for (const device of devices) {
      const service = this.services.find(x => x.uniqueId === device.id);
      if (service) {
        await this.getStatus(service);
        response[device.id] = this.types[service.type].query(service);
      } else {
        response[device.id] = {};
      }
    }

    return response;
  }

  /**
   * Process the EXECUTE intent
   * @param commands
   */
  async execute(commands: any): Promise<SmartHomeV1ExecuteResponseCommands[]> {
    const response: SmartHomeV1ExecuteResponseCommands[] = [];

    for (const command of commands) {
      for (const device of command.devices) {

        const service = this.services.find(x => x.uniqueId === device.id);

        if (service) {

          // check if two factor auth is required, and if we have it
          if (this.config.twoFactorAuthPin && this.types[service.type].twoFactorRequired &&
            this.types[service.type].is2faRequired(command) &&
            !(command.execution.length && command.execution[0].challenge &&
              command.execution[0].challenge.pin === this.config.twoFactorAuthPin.toString()
            )
          ) {
            this.log.info('Requesting Two Factor Authentication Pin');
            response.push({
              ids: [device.id],
              status: 'ERROR',
              errorCode: 'challengeNeeded',
              challengeNeeded: {
                type: 'pinNeeded',
              },
            });
          } else {
            // process the request
            if (await this.types[service.type].execute(service, command)) {
              response.push({
                ids: [device.id],
                status: 'SUCCESS',
                //TODO:            states,
              });
              this.log.error('execute STATES not implemented');
            } else {
              response.push({
                ids: [device.id],
                status: 'ERROR',
              });
            }

          }

        }
      }
    }
    return response;
  }

  /**
   * Request a status update from an accessory
   * @param service
   */
  async getStatus(service: ServiceType) {
    //  console.log('getStatus - service', service);
    const response = await service.refreshCharacteristics();
    //  console.log('getStatus - response', response);
    return response;
    //TODO: migrate
    /*
    const iids: number[] = service.serviceCharacteristics.map(c => c.iid);
    const body = '?id=' + iids.map(iid => `${service.aid}.${iid}`).join(',');
    this.log.debug(`Requesting status for ${service.serviceName} ${service.instance.username}`);
    this.log.error('getStatus not implemented');

    const characteristics = await new Promise((resolve, reject) => {
      this.hapClient.HAPstatus(service.instance.ipAddress, service.instance.port, body, (err, status) => {
        if (err) {
          return reject(err);
        }
        return resolve(status.characteristics);
      }, service.instance);
    }) as Array<HapCharacteristic>;

    for (const c of characteristics) {
      const characteristic = service.serviceCharacteristics.find(x => x.iid === c.iid);
      characteristic.value = c.value;
    }
    */
  }

  /**
   * Check that it's possible to connect to the instance
   */
  private async checkInstanceConnection(instance: HapInstance): Promise<boolean> {
    return new Promise((resolve) => {
      this.log.debug(`Checking connection to ${instance}`);
      this.log.error('checkInstanceConnection not implemented');
      /*
      console.log(JSON.stringify(instance));
      this.hapClient.HAPcontrol(instance.ipAddress, instance.instance.port, JSON.stringify(
        { characteristics: [{ aid: -1, iid: -1 }] },
      ), (err) => {
        if (err) {
          return resolve(false);
        }
        return resolve(true);
      }, instance.instance);
      */
    });
  }

  /**
   * Load accessories from Homebridge
   */

  /*
  async getAccessories() {
    return new Promise((resolve, reject) => {
      this.hapClient.HAPaccessories(async (instances: HapInstance[]) => {
        this.services = [];

        for (const instance of instances) {
          if (!await this.checkInstanceConnection(instance)) {
            this.instanceBlacklist.push(instance.instance.txt.id);
          }

          if (!this.instanceBlacklist.find(x => x.toLowerCase() === instance.instance.txt.id.toLowerCase())) {
            await this.parseAccessories(instance);
          } else {
            this.log.debug(`Instance [${instance.instance.txt.id}] on instance blacklist, ignoring.`);
          }
        }

        return resolve(true);
      });
    });
  }
  */
  /**
   * Load all the accessories from Homebridge
   */
  public async loadAccessories(): Promise<ServiceType[]> {
    //  if (!this.configService.homebridgeInsecureMode) {
    //    throw new BadRequestException('Homebridge must be running in insecure mode to access accessories.')
    //  }

    return this.hapClient.getAllServices().then((services) => {
      services = services.filter(x => this.types[x.type] !== undefined);
      return services
    }).catch((e) => {
      if (e.response?.status === 401) {
        this.log.warn('Homebridge must be running in insecure mode to view and control accessories from this plugin.')
      } else {
        this.log.error(`Failed load accessories from Homebridge: ${e.message}`)
      }
      return []
    })
  }

  /**
   * Parse accessories from homebridge and filter out the ones we support
   * @param instance
   */
  /*
  async parseAccessories(instance: HapInstance) {
    instance.accessories.accessories.forEach((accessory) => {
      // Ensure UUIDs are long form 
      for (const service of accessory.services) {
        service.type = toLongFormUUID(service.type);
        for (const characteristic of service.serviceCharacteristics) {
          characteristic.type = toLongFormUUID(characteristic.type);
        }
      }

      // get accessory information service
      const accessoryInformationService = accessory.services.find(x => x.type === Service.AccessoryInformation);
      const accessoryInformation = {};

      if (accessoryInformationService && accessoryInformationservice.serviceCharacteristics) {
        accessoryInformationservice.serviceCharacteristics.forEach((c) => {
          if (c.value) {
            accessoryInformation[c.description] = c.value;
          }
        });
      }

      // discover the service type
      accessory.services
        .filter(x => x.type !== Service.AccessoryInformation)
        .filter(x => ServicesTypes[x.type])
        .filter(x => Object.prototype.hasOwnProperty.call(this.types, ServicesTypes[x.type]))
        .forEach((service) => {
          service.accessoryInformation = accessoryInformation;
          service.aid = accessory.aid;
          service.type = ServicesTypes[service.type];

          service.instance = {
            ipAddress: instance.ipAddress,
            port: instance.instance.port,
            username: instance.instance.txt.id,
          };

          // generate unique id for service
          service.uniqueId = crypto.createHash('sha256')
            .update(`${service.instance.username}${service.aid}${service.iid}${service.type}`)
            .digest('hex');

          // discover name of service
          const serviceNameCharacteristic = service.serviceCharacteristics.find(x => [
            Characteristic.Name,
            Characteristic.ConfiguredName,
          ].includes(x.type));

          service.serviceName = (serviceNameCharacteristic && serviceNameCharacteristic.value.length) ?
            serviceNameCharacteristic.value : service.accessoryInformation.Name || service.type;

          // perform user-defined name replacements
          const nameMap = this.deviceNameMap.find(x => x.replace === service.serviceName);
          if (nameMap) {
            service.serviceName = nameMap.with;
          }

          // perform user-defined service filters based on name
          if (this.accessoryFilter.includes(service.serviceName)) {
            this.log.debug(`Skipping ${service.serviceName} ${service.accessoryInformation['Serial Number']} - matches accessoryFilter`);
            return;
          }

          // perform user-defined service filters based on serial number
          if (this.accessorySerialFilter.includes(service.accessoryInformation['Serial Number'])) {
            this.log.debug(`Skipping ${service.serviceName} ${service.accessoryInformation['Serial Number']} - matches accessorySerialFilter'`);
            return;
          }

          // if 2fa is forced for this service type, but a pin has not been set ignore the service
          if (this.types[service.type].twoFactorRequired && !this.config.twoFactorAuthPin && !this.config.disablePinCodeRequirement) {
            this.log.warn(`Not registering ${service.serviceName} - Pin cide has not been set and is required for secure ` +
              `${service.type} accessory types. See https://git.io/JUQWX`);
            return;
          }

          this.services.push(service);
        });
    });
  }
  */

  /**
   * Register hap characteristic event handlers
   */
  async registerCharacteristicEventHandlers() {
    const monitor = await this.hapClient.monitorCharacteristics();
    monitor.on('service-update', (events) => {
      this.handleHapEvent(events);
    });

    this.log.error('Registered HAP Event listeners not implemented');



    /*
        for (const service of this.services) {
          // get a list of characteristics we can watch
          console.log('registerCharacteristicEventHandlers: service', service);
          const evCharacteristics = service.serviceCharacteristics.filter(x => x.ev && this.evTypes.includes(x.type));
    
          if (evCharacteristics.length) {
            // register the instance if it's not already there
            if (!this.evInstances.find(x => x.username === service.instance.username)) {
              const newInstance = Object.assign({}, service.instance);
              newInstance.evCharacteristics = [];
              this.evInstances.push(newInstance);
            }
    
            const instance = this.evInstances.find(x => x.username === service.instance.username);
    
            for (const evCharacteristic of evCharacteristics) {
              if (!instance.evCharacteristics.find(x => x.aid === service.aid && x.iid === evCharacteristic.iid)) {
                instance.evCharacteristics.push({ aid: service.aid, iid: evCharacteristic.iid, ev: true });
              }
            }
          }
     
  }
     */
    // start listeners
    /*
    for (const instance of this.evInstances) {
      const unregistered = instance.evCharacteristics.filter(x => !x.registered);
      if (unregistered.length) {
        this.hapClient.HAPevent(instance.ipAddress, instance.port, JSON.stringify({
          characteristics: instance.evCharacteristics.filter(x => !x.registered),
        }), (err, response) => {
          if (err) {
            this.log.error(err.message);
            this.instanceBlacklist.push(instance.username);
            this.evInstances.splice(this.evInstances.indexOf(instance), 1);
          } else {
            instance.evCharacteristics.forEach((c) => {
              c.registered = true;
            });
            this.log.debug('HAP Event listeners registered succesfully');
          }
        }, instance);
      }
    }
    */
  }

  /**
   * Handle events from HAP
   * @param event
   */
  async handleHapEvent(events) {
    for (const event of events) {
      const accessories = this.services.filter(s =>
        s.instance.ipAddress === event.host && s.instance.port === event.port && s.aid === event.aid);
      const service = accessories.find(x => x.serviceCharacteristics.find(c => c.iid === event.iid));
      if (service) {
        const characteristic = service.serviceCharacteristics.find(c => c.iid === event.iid);
        characteristic.value = event.value;
        this.reportStateSubject.next(service.uniqueId);
      }
    }
  }

  /**
   * Generate a state report from the list pending
   * @param pendingStateReport
   */
  async processPendingStateReports(pendingStateReport) {
    const states = {};

    for (const uniqueId of pendingStateReport) {
      const service = this.services.find(x => x.uniqueId === uniqueId);
      states[service.uniqueId] = this.types[service.type].query(service);
    }

    return await this.sendStateReport(states);
  }

  async sendFullStateReport() {
    const states = {};

    // don't report state if there are no services
    if (!this.services.length) {
      return;
    }
    this.services.map((service) => {
      if (!this.types[service.type]) {
        return;
      }
      return states[service.uniqueId] = this.types[service.type].query(service);
    });
    return await this.sendStateReport(states);
  }

  /**
   * Send the state report back to Google
   * @param states
   * @param requestId
   */
  async sendStateReport(states, requestId?) {
    const payload = {
      requestId,
      type: 'report-state',
      body: states,
    };
    this.log.debug('Sending State Report');
    this.log.debug(JSON.stringify(payload, null, 2));
    this.socket.sendJson(payload);
  }


  /**
   * Close the HAP connection, used for testing
   */
  public async destroy() {
    this.hapClient.resetInstancePool();
  }
}
