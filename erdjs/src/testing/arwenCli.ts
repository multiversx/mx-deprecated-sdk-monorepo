import child_process = require("child_process");
import { ArwenDebugProvider, DeployRequest, DeployResponse, UpgradeRequest, UpgradeResponse, RunRequest, RunResponse, CreateAccountResponse, CreateAccountRequest, QueryRequest, QueryResponse } from "./arwen";
import { getToolsPath } from "./workstation"
import { MyExecError } from "./errors";
import { readJSONFile } from "./ioutils";
import path = require("path");

export class ArwenCLI implements ArwenDebugProvider {
    async deployContract(request: DeployRequest): Promise<DeployResponse> {
        let [outcomeKey, outcomePath] = this.createOutcomeCoordinates(request.databasePath);
        let options: any = {
            program: this.getArwenDebugPath(),
            args: [
                "deploy",
                `--database=${request.databasePath}`,
                `--world=${request.world}`,
                `--outcome=${outcomeKey}`,
                `--impersonated=${request.impersonated}`,
                `--code=${request.code}`,
                `--code-path=${request.codePath}`,
                `--code-metadata=${request.codeMetadata}`,
                `--value=${request.value}`,
                `--gas-limit=${request.gasLimit}`,
                `--gas-price=${request.gasPrice}`
            ]
        };

        await execute(options);

        let response = readJSONFile(DeployResponse, outcomePath);
        return response;
    }

    async upgradeContract(request: UpgradeRequest): Promise<UpgradeResponse> {
        let [outcomeKey, outcomePath] = this.createOutcomeCoordinates(request.databasePath);
        let options: any = {
            program: this.getArwenDebugPath(),
            args: [
                "upgrade",
                `--database=${request.databasePath}`,
                `--world=${request.world}`,
                `--outcome=${outcomeKey}`,
                `--impersonated=${request.impersonated}`,
                `--code=${request.code}`,
                `--code-path=${request.codePath}`,
                `--code-metadata=${request.codeMetadata}`,
                `--value=${request.value}`,
                `--gas-limit=${request.gasLimit}`,
                `--gas-price=${request.gasPrice}`
            ]
        };

        await execute(options);

        let response = readJSONFile(UpgradeResponse, outcomePath);
        return response;
    }

    async runContract(request: RunRequest): Promise<RunResponse> {
        let [outcomeKey, outcomePath] = this.createOutcomeCoordinates(request.databasePath);
        let options: any = {
            program: this.getArwenDebugPath(),
            args: [
                "run",
                `--database=${request.databasePath}`,
                `--world=${request.world}`,
                `--outcome=${outcomeKey}`,
                `--contract=${request.contractAddress}`,
                `--impersonated=${request.impersonated}`,
                `--function=${request.function}`,
                `--value=${request.value}`,
                `--gas-limit=${request.gasLimit}`,
                `--gas-price=${request.gasPrice}`
            ]
        };

        await execute(options);

        let response = readJSONFile(RunResponse, outcomePath);
        return response;
    }

    async queryContract(request: QueryRequest): Promise<QueryResponse> {
        let [outcomeKey, outcomePath] = this.createOutcomeCoordinates(request.databasePath);
        let options: any = {
            program: this.getArwenDebugPath(),
            args: [
                "query",
                `--database=${request.databasePath}`,
                `--world=${request.world}`,
                `--outcome=${outcomeKey}`,
                `--contract=${request.contractAddress}`,
                `--impersonated=${request.impersonated}`,
                `--function=${request.function}`
            ]
        };

        await execute(options);

        let response = readJSONFile(QueryResponse, outcomePath);
        return response;
    }

    async createAccount(request: CreateAccountRequest): Promise<CreateAccountResponse> {
        let [outcomeKey, outcomePath] = this.createOutcomeCoordinates(request.databasePath);
        let options: any = {
            program: this.getArwenDebugPath(),
            args: [
                "create-account",
                `--database=${request.databasePath}`,
                `--world=${request.world}`,
                `--outcome=${outcomeKey}`,
                `--address=${request.address}`,
                `--balance=${request.balance}`,
                `--nonce=${request.nonce}`
            ]
        };

        await execute(options);

        let response = readJSONFile(CreateAccountResponse, outcomePath);
        return response;
    }

    private createOutcomeCoordinates(databasePath: string): [string, string] {
        let outcomeKey = Math.random().toString(36).substring(2, 15);
        let outcomePath = path.join(databasePath, "out", `${outcomeKey}.json`);
        return [outcomeKey, outcomePath];
    }

    private getArwenDebugPath(): string {
        return process.env.ARWENDEBUG || getToolsPath("arwentools/geb3c3f7/arwendebug");
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
            lastStdout = data.trim();
            console.log(lastStdout);
        });
    }

    if (subprocess.stderr) {
        subprocess.stderr.setEncoding('utf8');

        subprocess.stderr.on("data", function (data: string) {
            lastStderr = data.trim();
            console.warn(lastStderr);
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