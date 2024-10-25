import { Characteristic } from '../hap-types';
import { AccessoryTypeExecuteResponse } from '../interfaces';
import { ServiceType } from '@homebridge/hap-client';

export class LockMechanism {
  public twoFactorRequired = true;

  sync(service: ServiceType) {
    return {
      id: service.uniqueId,
      type: 'action.devices.types.LOCK',
      traits: [
        'action.devices.traits.LockUnlock',
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
    const response = {
      online: true,
    } as any;

    const currentLockState = service.serviceCharacteristics.find(x => x.uuid === Characteristic.LockCurrentState).value;

    switch (currentLockState) {
      case (0): {
        response.isLocked = false;
        response.isJammed = false;
        break;
      }
      case (1): {
        response.isLocked = true;
        response.isJammed = false;
        break;
      }
      case (2): {
        response.isLocked = false;
        response.isJammed = true;
        break;
      }
      case (3): {
        response.isLocked = false;
        response.isJammed = false;
        break;
      }
    }

    return response;
  }

  execute(service: ServiceType, command): AccessoryTypeExecuteResponse {
    if (!command.execution.length) {
      return { payload: { characteristics: [] } };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.LockUnlock'): {
        const payload = {
          characteristics: [{
            aid: service.aid,
            iid: service.serviceCharacteristics.find(x => x.uuid === Characteristic.LockTargetState).iid,
            value: command.execution[0].params.lock ? 1 : 0,
          }],
        };
        return { payload };
      }
    }
  }

  is2faRequired(command): boolean {
    if (!command.execution.length) {
      return false;
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.LockUnlock'): {
        if (command.execution[0].params.lock === false) {
          return true;
        }
      }
    }

    return false;
  }
}