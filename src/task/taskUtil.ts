/**
 * 一个简易的任务池，
 */
enum TASK_STATUS {
    PENDING,
    DONGING,
    DONE,
}
interface IConnection {
    disconnect: (task: Task) => void;
}

export abstract class Task {
    private taskStatus = TASK_STATUS.PENDING;
    private connection: IConnection | null = null;
    public taskIsSuccess: boolean = false;
    excute() {
        this.donging();

        const taskHandle = this.task();
        if (taskHandle instanceof Promise) {
            taskHandle.then(() => {
                this.taskIsSuccess = true;
            }).catch((error) => {
                this.taskIsSuccess = false;
                console.log(error);
            }).finally(() => {
                this.done();
            });
        } else {
            this.done();
        }

    }
    abstract task(): void | Promise<any>;
    setConnection(connection: IConnection) {
        this.connection = connection;
    }
    donging() {
        this.taskStatus = TASK_STATUS.DONGING;
    }
    done() {
        this.taskStatus = TASK_STATUS.DONE;
        this.connection && this.connection.disconnect(this);
    }
    getStatus() {
        return this.taskStatus;
    }
}

export class TaskPool implements IConnection {

    private taskMaxNum: number;

    public constructor(taskMaxNum: number) {
        this.taskMaxNum = taskMaxNum;
    }

    private taskList: Task[] = [];
    private doningList: Task[] = [];
    private doneList: Task[] = [];
    private finishListeners: Function[] = [];
    private progressListeners: Function[] = [];
    addTask(task: Task) {
        if (task.getStatus() === TASK_STATUS.PENDING) {
            this.taskList.push(task);
        }
        if (this.taskList.length === 1 && this.doningList.length < this.taskMaxNum) {
            // 当有一个任务时且有空余的task执行
            this.excute();
        }
    }
    removeTask(task: Task) {
        if (task.getStatus() !== TASK_STATUS.DONGING) {
            task.done(); // 不从task栈中去除，只改变状态，改变状态后，轮到此任务会直接跳过
        }
    }
    excute() {
        if (this.doningList.length < this.taskMaxNum) {
            const task = this.taskList.shift();
            if (task && task.getStatus() !== TASK_STATUS.DONE) {
                task.setConnection(this);
                this.doningList.push(task);
                task.excute();
            } else {
                // 任务完成
                if (this.doningList.length === 0) {
                    this.finishListeners.forEach((lis) => {
                        if (lis) {
                            lis(this.doneList);
                        }
                    });
                    this.doneList = [];
                    this.finishListeners = [];
                    this.progressListeners = [];
                }
            }
        }
    }
    disconnect(task: Task) {
        // 将任务从doningList中删除
        const doningList = this.doningList;
        doningList.find((taskItem, index) => {
            if (taskItem === task) {
                doningList.splice(index, 1);
                return true;
            }
        });
        this.doneList.push(task);
        this.doProgress();
        this.excute();
    }
    doProgress() {
        const doneLen = this.doneList.length;
        const allLen = (doneLen + this.doningList.length) || 1;
        const progress = doneLen / allLen;
        this.progressListeners.forEach((listener) => {
            if (listener) {
                listener(progress);
            }
        });
    }
    onProgress(listener: Function) {
        this.progressListeners.push(listener);
    }
    addFinishListener(listener: Function) {
        this.finishListeners.push(listener);
    }
}
