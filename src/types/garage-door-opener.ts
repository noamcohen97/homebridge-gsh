import type { SmartHomeV1ExecuteRequestCommands, SmartHomeV1SyncDevices, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';
import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse, HapDevice } from '../interfaces';
import { ServiceType } from '@homebridge/hap-client';

export class GarageDoorOpener implements HapDevice {
  public twoFactorRequired = true;

  sync(service: ServiceType): SmartHomeV1SyncDevices {
    return {
      id: service.uniqueId,
      type: 'action.devices.types.GARAGE',
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
        openDirection: ['UP', 'DOWN'],
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
    /**
     * GSH impliments garrage door as an open percentage, while HomeKit impliments it as open/closed/opening/closing
     * To work around this we just set the values to something that works.
     */
    const currentDoorState: number = Number(service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentDoorState).value);
    // open, closed, opening, closing, stopped
    const openPercent = [100, 0, 50, 50, 50, 50][currentDoorState];

    return {
      on: true,
      online: true,
      openPercent,
    } as any;
  }

  async execute(service: ServiceType, command: SmartHomeV1ExecuteRequestCommands): Promise<SmartHomeV1ExecuteResponseCommands> {
    if (!command.execution.length) {
      return { ids: [service.uniqueId], status: 'ERROR', debugString: 'missing command' };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.OpenClose'): {
        await service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetDoorState).setValue(command.execution[0].params.openPercent ? 0 : 1);
        return { ids: [service.uniqueId], status: 'SUCCESS' };
      }
      default: { return { ids: [service.uniqueId], status: 'ERROR', debugString: 'unknown command ' + command.execution[0].command }; }
    }
  }

  is2faRequired(command: SmartHomeV1ExecuteRequestCommands): boolean {
    if (!command.execution.length) {
      return false;
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.OpenClose'): {
        if (command.execution[0].params.openPercent > 0) {
          return true;
        }
      }
    }

    return false;
  }

}