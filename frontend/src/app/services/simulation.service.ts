import { Injectable } from '@angular/core';
import * as acorn from 'acorn';

export interface Frame {
    callStack: string[];
    webApis: { name: string; remainingTime?: number }[];
    microtasks: string[];
    macrotasks: string[];
    consoleLogs: string[];
    highlightLine?: number;
}

@Injectable({
    providedIn: 'root'
})
export class SimulationService {
    constructor() { }

    run(code: string): Frame[] {
        const frames: Frame[] = [];
        const microtasks: string[] = [];
        const macrotasks: string[] = [];
        const webApis: { name: string; remainingTime?: number; callback: string }[] = [];
        const consoleLogs: string[] = [];
        const callStack: string[] = [];

        // Snapshot helper
        const captureFrame = (line?: number) => {
            frames.push({
                callStack: [...callStack],
                webApis: webApis.map(api => ({ name: api.name, remainingTime: api.remainingTime })),
                microtasks: [...microtasks],
                macrotasks: [...macrotasks],
                consoleLogs: [...consoleLogs],
                highlightLine: line
            });
        };

        try {
            const ast = acorn.parse(code, { ecmaVersion: 2020, locations: true });

            // 1. Run Loop (Main Script)
            captureFrame();
            callStack.push('main()');
            captureFrame();

            // Simple interpreter
            this.executeNodes(ast.body, {
                callStack, webApis, microtasks, macrotasks, consoleLogs, captureFrame
            });

            callStack.pop(); // main() done
            captureFrame();

            // 2. Event Loop
            let ticks = 0;
            const MAX_TICKS = 100; // Safety break

            while ((microtasks.length > 0 || macrotasks.length > 0 || webApis.length > 0) && ticks < MAX_TICKS) {
                ticks++;

                // Process WebAPIs (simulate time passing / events completing)
                // Strict mapping: WebAPI -> Macrotask Queue
                const completedApiIndex = webApis.findIndex(api => api.remainingTime !== undefined);
                if (completedApiIndex !== -1) {
                    const api = webApis.splice(completedApiIndex, 1)[0];
                    macrotasks.push(api.callback);
                    captureFrame();
                }

                // Priority 1: Microtasks (Process ALL)
                if (microtasks.length > 0) {
                    while (microtasks.length > 0) {
                        const task = microtasks.shift()!;
                        callStack.push(task);
                        captureFrame();

                        // Execute task (mock)
                        consoleLogs.push(`Executed microtask: ${task}`);

                        callStack.pop();
                        captureFrame();
                    }
                    continue; // Check for more microtasks (if any added) or move to rendering
                }

                // Priority 2: Macrotasks (Process ONE)
                if (callStack.length === 0 && macrotasks.length > 0) {
                    const task = macrotasks.shift()!;
                    callStack.push(task);
                    captureFrame();

                    // Execute task
                    consoleLogs.push(`Executed macrotask: ${task}`);

                    callStack.pop();
                    captureFrame();
                    continue;
                }

                // If we are here and have no tasks but have apis, we wait (loop continues)
                if (webApis.length === 0 && microtasks.length === 0 && macrotasks.length === 0) {
                    break;
                }
            }

        } catch (e: any) {
            console.error(e);
            throw new SyntaxError(`Parsing error at ${e.loc?.line}:${e.loc?.column}: ${e.message}`);
        }

        return frames;
    }

    private executeNodes(nodes: any[], ctx: any) {
        for (const node of nodes) {
            this.executeNode(node, ctx);
        }
    }

    private executeNode(node: any, ctx: any) {
        if (node.type === 'ExpressionStatement') {
            this.executeNode(node.expression, ctx);
        } else if (node.type === 'CallExpression') {
            this.handleCallExpression(node, ctx);
        }
        // Add more node types as needed
    }

    private handleCallExpression(node: any, ctx: any) {
        const { callStack, webApis, microtasks, macrotasks, consoleLogs, captureFrame } = ctx;
        const callee = node.callee;

        // console.log
        if (callee.type === 'MemberExpression' && callee.object.name === 'console' && callee.property.name === 'log') {
            const arg = node.arguments[0]?.value || node.arguments[0]?.raw || '';
            callStack.push('console.log');
            captureFrame(node.loc.start.line);
            consoleLogs.push(arg);
            callStack.pop();
            captureFrame();
        }
        // setTimeout
        else if (callee.name === 'setTimeout') {
            callStack.push('setTimeout');
            captureFrame(node.loc.start.line);
            const cbName = 'anonymous()'; // In full version, parse arrow func body
            webApis.push({ name: 'setTimeout', remainingTime: 0, callback: cbName });
            callStack.pop();
            captureFrame();
        }
        // Promise.resolve().then()
        else if (callee.type === 'MemberExpression' && callee.property.name === 'then') {
            // Simplified detection for Promise.resolve().then()
            callStack.push('Promise.then');
            captureFrame(node.loc.start.line);
            microtasks.push('anonymous()'); // Promise callback
            callStack.pop();
            captureFrame();
        }
    }
}
