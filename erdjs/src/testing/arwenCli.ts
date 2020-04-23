import child_process = require("child_process");
import { ArwenDebugProvider, DeployRequest, DeployResponse, UpgradeRequest, UpgradeResponse, RunRequest, RunResponse, CreateAccountResponse, CreateAccountRequest, QueryRequest, QueryResponse } from "./arwen";

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
        let options: any = {};
        options.program = this.getArwenDebugPath();
        options.args = ["create-account"];
        await execute(options);
        return new CreateAccountResponse();
    }

    private getArwenDebugPath(): string {
        return process.env.ARWENDEBUG || "arwendebug";
    }
}

function execute(options: any): Promise<any> {
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
        //reject(new MyExecError({ Program: programName, Message: error.message }));
    });

    // subprocess.stdout.setEncoding('utf8');
    // subprocess.stderr.setEncoding('utf8');

    // subprocess.stdout.on("data", function (data: string) {
    // });

    // subprocess.stderr.on("data", function (data: string) {
    // });

    subprocess.on("close", function (code: number) {
        if (code == 0) {
            //resolve({ code: code, stdOut: latestStdout.trim() });
        } else {
            //reject(new MyExecError({ Program: programName, Message: latestStderr, Code: code.toString() }));
        }
    });

    return promise;
}