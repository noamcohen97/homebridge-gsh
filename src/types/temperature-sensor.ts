import type { SmartHomeV1ExecuteRequestCommands, SmartHomeV1SyncDevices } from 'actions-on-google';
import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse } from '../interfaces';
import { Hap } from '../hap';
import { ServiceType } from '@homebridge/hap-client';

export class TemperatureSensor {
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

  execute(service: ServiceType, command: SmartHomeV1ExecuteRequestCommands): AccessoryTypeExecuteResponse {
    return { payload: { characteristics: [] } };
  }

}