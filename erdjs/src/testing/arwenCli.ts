import child_process = require("child_process");
import { ArwenDebugProvider, DeployRequest, DeployResponse, UpgradeRequest, UpgradeResponse, RunRequest, RunResponse, CreateAccountResponse, CreateAccountRequest, QueryRequest, QueryResponse } from "./arwen";
import { getToolsPath } from "./workstation"
import { MyExecError } from "./errors";
import { readJSONFile } from "./ioutils";
import path = require("path");

export class ArwenCLI implements ArwenDebugProvider {
    async deployContract(request: DeployRequest): Promise<DeployResponse> {
        throw new Error("Method not implemented.");
    }

    async upgradeContract(request: UpgradeRequest): Promise<UpgradeResponse> {
        throw new Error("Method not implemented.");
    }

    async runContract(request: RunRequest): Promise<RunResponse> {
        throw new Error("Method not implemented.");
    }

    async queryContract(request: QueryRequest): Promise<QueryResponse> {
        throw new Error("Method not implemented.");
    }

    async createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse> {
        let outcomeKey = this.createOutcomeKey();
        let outcomePath = this.getOutcomePath(request.databasePath, outcomeKey);

        let options: any = {};
        options.program = this.getArwenDebugPath();
        options.args = [
            "create-account",
            `--database=${request.databasePath}`,
            `--world=${request.world}`,
            `--outcome=${outcomeKey}`,
            `--address=${request.address}`,
            `--balance=${request.balance}`,
            `--nonce=${request.nonce}`
        ];

        await execute(options);
        let response = readJSONFile(CreateAccountResponse, outcomePath);
        return response;
    }

    private createOutcomeKey(): string {
        return Math.random().toString(36).substring(2, 15);
    }

    private getOutcomePath(databasePath: string, key: string): string {
        return path.join(databasePath, "out", `${key}.json`);
    }

    private getArwenDebugPath(): string {
        return "/home/andrei/Desktop/workspaces/go/arwen-wasm-vm/cmd/arwendebug/arwendebug";
        return process.env.ARWENDEBUG || getToolsPath("arwendebug");
    }
}

async function execute(options: any): Promise<any> {
    var resolve: any, reject: any;
    let promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });

    let program = options.program;
    let workingDirectory = options.workingDirectory;
    let args = options.args;
    let environment = options.environment;

    let spawnOptions: child_process.SpawnOptions = {
        cwd: workingDirectory,
        env: environment
    };

    let subprocess = child_process.spawn(program, args, spawnOptions);

    subprocess.on("error", function (error) {
        reject(new MyExecError({ program: program, message: error.message }));
    });

    let lastStderr: string;
    let lastStdout: string;

    if (subprocess.stdout) {
        subprocess.stdout.setEncoding('utf8');

        subprocess.stdout.on("data", function (data: string) {
            lastStdout = data;
            console.log(data);
        });
    }

    if (subprocess.stderr) {
        subprocess.stderr.setEncoding('utf8');

        subprocess.stderr.on("data", function (data: string) {
            lastStderr = data;
            console.warn(data);
        });
    }

    subprocess.on("close", function (code: number) {
        if (code == 0) {
            resolve({ code: code });
        } else {
            reject(new MyExecError({ program: program, code: code.toString(), message: lastStderr || lastStdout }));
        }
    });

    return promise;
}