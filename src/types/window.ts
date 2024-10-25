
import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse } from '../interfaces';
import { ServiceType } from '@homebridge/hap-client';

export class Window {
  sync(service: ServiceType) {
    return {
      id: service.uniqueId,
      type: 'action.devices.types.WINDOW',
      traits: [
        'action.devices.traits.OpenClose',
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
        openDirection: ['LEFT', 'RIGHT'],
      },
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
      on: true,
      online: true,
      openPercent: service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentPosition).value,
    };
  }

  execute(service: ServiceType, command): AccessoryTypeExecuteResponse {
    if (!command.execution.length) {
      return { payload: { characteristics: [] } };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.OpenClose'): {
        const payload = {
          characteristics: [{
            aid: service.aid,
            iid: service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetPosition).iid,
            value: command.execution[0].params.openPercent,
          }],
        };
        return { payload };
      }
    }
  }

}