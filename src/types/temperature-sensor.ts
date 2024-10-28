import type { SmartHomeV1ExecuteRequestCommands, SmartHomeV1SyncDevices, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';
import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse, HapDevice } from '../interfaces';
import { Hap } from '../hap';
import { ServiceType } from '@homebridge/hap-client';

export class TemperatureSensor implements HapDevice {
  constructor(
    private hap: Hap,
  ) { }

  sync(service: ServiceType): SmartHomeV1SyncDevices {
    return {
      id: service.uniqueId,
      type: 'action.devices.types.SENSOR',
      traits: [
        'action.devices.traits.TemperatureControl',
      ],
      name: {
        defaultNames: [
          service.serviceName,
          service.accessoryInformation.Name,
        ],
        name: service.serviceName,
        nicknames: [],
      },
      willReportState: true,
      attributes: {
        queryOnlyTemperatureControl: true,
        temperatureUnitForUX: this.hap.config.forceFahrenheit ? 'F' : 'C',
      },
      deviceInfo: {
        manufacturer: service.accessoryInformation.Manufacturer,
        model: service.accessoryInformation.Model,
        hwVersion: service.accessoryInformation.HardwareRevision,
        swVersion: service.accessoryInformation.SoftwareRevision,
      },
      customData: {
        aid: service.aid,
        iid: service.iid,
        instanceUsername: service.instance.username,
        instanceIpAddress: service.instance.ipAddress,
        instancePort: service.instance.port,
      },
    };
  }

  query(service: ServiceType) {
    return {
      online: true,
      temperatureSetpointCelsius: service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentTemperature)?.value,
      temperatureAmbientCelsius: service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentTemperature)?.value,
    } as any;
  }

  async execute(service: ServiceType, command: SmartHomeV1ExecuteRequestCommands): Promise<SmartHomeV1ExecuteResponseCommands> {
    if (!command.execution.length) {
      return { ids: [service.uniqueId], status: 'ERROR', debugString: 'missing command' };
    }
    return { ids: [service.uniqueId], status: 'ERROR', debugString: 'unknown command ' + command.execution[0].command };;
  }

}