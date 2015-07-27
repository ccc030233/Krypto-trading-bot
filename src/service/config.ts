/// <reference path="../../typings/tsd.d.ts" />
/// <reference path="../common/models.ts" />

import Utils = require("./utils");
import _ = require("lodash");
import fs = require("fs");

export interface IConfigProvider {
    GetString(configKey: string): string;
    GetNumber(configKey: string): number;
    
    inBacktestMode: boolean;
}

export class ConfigProvider implements IConfigProvider {
    private static Log: Utils.Logger = Utils.log("tribeca:config");
    private _config: { [key: string]: string } = {};

    constructor() {
        if (process.env.hasOwnProperty("TRIBECA_BACKTEST_MODE")) {
            this.inBacktestMode = process.env["TRIBECA_BACKTEST_MODE"] === "true";
        }
        
        if (process.env.hasOwnProperty("TRIBECA_CONFIG_FILE")) {
            this._config = JSON.parse(fs.readFileSync(process.env["TRIBECA_CONFIG_FILE"], "utf-8"));
        }
    }

    public GetNumber = (configKey: string): number => {
        return parseFloat(this.GetString(configKey));
    };

    public GetString = (configKey: string): string => {
        var value = this.Fetch(configKey);
        ConfigProvider.Log("%s = %s", configKey, value);
        return value;
    };
    
    private Fetch = (configKey: string): string => {
        if (process.env.hasOwnProperty(configKey))
            return process.env[configKey];
        
        if (this._config.hasOwnProperty(configKey))
            return this._config[configKey];

        throw Error("Config does not have property " + configKey);
    };
    
    inBacktestMode: boolean = false;
}