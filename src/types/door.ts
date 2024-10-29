
import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse, HapDevice } from '../interfaces';
import { ServiceType } from '@homebridge/hap-client';
import { SmartHomeV1ExecuteResponseCommands, SmartHomeV1ExecuteRequestCommands } from 'actions-on-google';

export class Door implements HapDevice {
  sync(service: ServiceType) {
    return {
      id: service.uniqueId,
      type: 'action.devices.types.DOOR',
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
        openDirection: ['IN', 'OUT'],
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

  async execute(service: ServiceType, command: SmartHomeV1ExecuteRequestCommands): Promise<SmartHomeV1ExecuteResponseCommands> {
    if (!command.execution.length) {
      return { ids: [service.uniqueId], status: 'ERROR', debugString: 'missing command' };
    }
    switch (command.execution[0].command) {
      case ('action.devices.commands.OpenClose'): {
        await service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetPosition).setValue(command.execution[0].params.openPercent);
        return { ids: [service.uniqueId], status: 'SUCCESS' };
      }
      default: { return { ids: [service.uniqueId], status: 'ERROR', debugString: 'unknown command ' + command.execution[0].command }; }
    }
  }

}