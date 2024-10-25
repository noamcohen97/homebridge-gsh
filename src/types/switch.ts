import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse } from '../interfaces';
import { ServiceType } from '@homebridge/hap-client';

export class Switch {
  private deviceType: string;

  constructor(type) {
    this.deviceType = type;
  }

  sync(service: ServiceType) {
    return {
      id: service.uniqueId,
      type: this.deviceType,
      traits: [
        'action.devices.traits.OnOff',
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
      deviceInfo: {
        manufacturer: service.accessoryInformation.Manufacturer,
        model: service.accessoryInformation.Model,
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
      on: service.serviceCharacteristics.find(x => x.uuid === Characteristic.On).value ? true : false,
      online: true,
    };
  }

  execute(service: ServiceType, command): AccessoryTypeExecuteResponse {
    if (!command.execution.length) {
      return { payload: { characteristics: [] } };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.OnOff'): {
        const payload = {
          characteristics: [{
            aid: service.aid,
            iid: service.serviceCharacteristics.find(x => x.uuid === Characteristic.On).iid,
            value: command.execution[0].params.on,
          }],
        };
        return { payload };
      }
    }
  }

}