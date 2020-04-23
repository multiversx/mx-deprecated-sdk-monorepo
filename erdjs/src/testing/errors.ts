
export class MyError {
    message: string = "";
    inner: MyError | null = null;

    public constructor(init?: Partial<MyError>) {
        Object.assign(this, init);
        this.message = `${this.message}; ${this.inner?.message}`;
    }
}

export class MyExecError extends MyError {
    program: string = "";
    code: string = "";

    public constructor(init?: Partial<MyExecError>) {
        super();
        Object.assign(this, init);
        this.message = `program="${this.program}", code=[${this.code}]; [${this.message}]`;
    }
}
