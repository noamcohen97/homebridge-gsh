import type { SmartHomeV1ExecuteRequestCommands, SmartHomeV1SyncDevices, SmartHomeV1ExecuteResponseCommands } from 'actions-on-google';
import { Characteristic } from '../hap-types';
import { ServiceType } from '@homebridge/hap-client';
import { AccessoryTypeExecuteResponse, HapDevice } from '../interfaces';
import { Hap } from '../hap';

export class Thermostat implements HapDevice {
  constructor(
    private hap: Hap,
  ) { }

  sync(service: ServiceType) {
    const availableThermostatModes = ['off', 'heat', 'cool'];

    if (service.serviceCharacteristics.find(x => x.uuid === Characteristic.CoolingThresholdTemperature) &&
      service.serviceCharacteristics.find(x => x.uuid === Characteristic.HeatingThresholdTemperature)) {
      availableThermostatModes.push('heatcool');
    } else {
      availableThermostatModes.push('auto');
    }

    return {
      id: service.uniqueId,
      type: 'action.devices.types.THERMOSTAT',
      traits: [
        'action.devices.traits.TemperatureSetting',
      ],
      attributes: {
        availableThermostatModes: availableThermostatModes.join(','),
        thermostatTemperatureUnit: this.hap.config.forceFahrenheit ? 'F'
          : service.serviceCharacteristics.find(x => x.uuid === Characteristic.TemperatureDisplayUnits).value ? 'F' : 'C',
      },
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
    const targetHeatingCoolingState: number = Number(service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetHeatingCoolingState).value);
    const thermostatMode = ['off', 'heat', 'cool', 'auto'][targetHeatingCoolingState];

    const response = {
      online: true,
      thermostatMode,
      thermostatTemperatureSetpoint: service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetTemperature).value,
      thermostatTemperatureAmbient: service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentTemperature).value,
    } as any;

    // check if device reports CurrentRelativeHumidity
    if (service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentRelativeHumidity)) {
      response.thermostatHumidityAmbient = service.serviceCharacteristics.find(x => x.uuid === Characteristic.CurrentRelativeHumidity).value;
    }

    // check if device reports CoolingThresholdTemperature and HeatingThresholdTemperature
    if (service.serviceCharacteristics.find(x => x.uuid === Characteristic.CoolingThresholdTemperature) &&
      service.serviceCharacteristics.find(x => x.uuid === Characteristic.HeatingThresholdTemperature)) {

      // translate mode
      if (response.thermostatMode === 'auto') {
        response.thermostatMode = 'heatcool';
      }

      response.thermostatTemperatureSetpointLow = service.serviceCharacteristics.find(x => x.uuid === Characteristic.HeatingThresholdTemperature).value;
      response.thermostatTemperatureSetpointHigh = service.serviceCharacteristics.find(x => x.uuid === Characteristic.CoolingThresholdTemperature).value;
    }

    return response;
  }

  async execute(service: ServiceType, command: SmartHomeV1ExecuteRequestCommands): Promise<SmartHomeV1ExecuteResponseCommands> {
    if (!command.execution.length) {
      return { ids: [service.uniqueId], status: 'ERROR', debugString: 'missing command' };
    }

    switch (command.execution[0].command) {
      case ('action.devices.commands.ThermostatSetMode'): {
        const mode = {
          off: 0,
          heat: 1,
          cool: 2,
          auto: 3,
          heatcool: 3,
        };
        await service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetHeaterCoolerState).setValue(mode[command.execution[0].params.thermostatMode]);
        return { ids: [service.uniqueId], status: 'SUCCESS' };
      }
      case ('action.devices.commands.ThermostatTemperatureSetpoint'): {
        await service.serviceCharacteristics.find(x => x.uuid === Characteristic.TargetTemperature).setValue(command.execution[0].params.thermostatTemperatureSetpoint);
        return { ids: [service.uniqueId], status: 'SUCCESS' };
      }
      case ('action.devices.commands.ThermostatTemperatureSetRange'): {
        await service.serviceCharacteristics.find(x => x.uuid === Characteristic.CoolingThresholdTemperature).setValue(command.execution[0].params.thermostatTemperatureSetpointHigh)
        await service.serviceCharacteristics.find(x => x.uuid === Characteristic.HeatingThresholdTemperature).setValue(command.execution[0].params.thermostatTemperatureSetpointLow);
        return { ids: [service.uniqueId], status: 'SUCCESS' };
      }
      default: { return { ids: [service.uniqueId], status: 'ERROR', debugString: 'unknown command ' + command.execution[0].command }; }
    }
  }

}