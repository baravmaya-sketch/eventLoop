import { Injectable } from '@angular/core';
import * as acorn from 'acorn';

export interface Frame {
    callStack: string[];
    webApis: { name: string; remainingTime?: number; callback: string }[];
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
        const variables: Record<string, any> = {};

        // Snapshot helper
        const captureFrame = (line?: number) => {
            frames.push({
                callStack: [...callStack],
                webApis: webApis.map(api => ({ name: api.name, remainingTime: api.remainingTime, callback: api.callback })),
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
                callStack, webApis, microtasks, macrotasks, consoleLogs, variables, captureFrame
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
                for (let i = webApis.length - 1; i >= 0; i--) {
                    const api = webApis[i];
                    if (api.remainingTime !== undefined) {
                        api.remainingTime = Math.max(0, api.remainingTime - 1);
                        if (api.remainingTime === 0) {
                            webApis.splice(i, 1);
                            macrotasks.push(api.callback);
                            captureFrame();
                        }
                    }
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
        if (!node) return;
        if (node.type === 'ExpressionStatement') {
            this.executeNode(node.expression, ctx);
        } else if (node.type === 'CallExpression') {
            this.handleCallExpression(node, ctx);
        } else if (node.type === 'VariableDeclaration') {
            ctx.captureFrame(node.loc.start.line);
            for (const dec of node.declarations) {
                if (dec.id && dec.init) {
                    ctx.variables[dec.id.name] = this.evaluateExpression(dec.init, ctx);
                } else if (dec.id) {
                    ctx.variables[dec.id.name] = undefined;
                }
            }
        } else if (node.type === 'AssignmentExpression') {
            ctx.captureFrame(node.loc.start.line);
            if (node.left.type === 'Identifier') {
                ctx.variables[node.left.name] = this.evaluateExpression(node.right, ctx);
            }
        } else if (node.type === 'UpdateExpression') {
            ctx.captureFrame(node.loc.start.line);
            this.evaluateExpression(node, ctx);
        } else if (node.type === 'FunctionDeclaration') {
            ctx.captureFrame(node.loc.start.line);
        } else if (node.type === 'ForStatement') {
            ctx.captureFrame(node.loc.start.line);
            if (node.init) this.executeNode(node.init, ctx);
            let loops = 0;
            while ((!node.test || this.evaluateExpression(node.test, ctx)) && loops < 50) {
                loops++;
                if (node.body.type === 'BlockStatement') {
                    this.executeNodes(node.body.body, ctx);
                } else {
                    this.executeNode(node.body, ctx);
                }
                if (node.update) this.executeNode(node.update, ctx);
                ctx.captureFrame(node.loc.start.line);
            }
        } else if (node.type === 'WhileStatement') {
            ctx.captureFrame(node.loc.start.line);
            let loops = 0;
            while (this.evaluateExpression(node.test, ctx) && loops < 50) {
                loops++;
                if (node.body.type === 'BlockStatement') {
                    this.executeNodes(node.body.body, ctx);
                } else {
                    this.executeNode(node.body, ctx);
                }
                ctx.captureFrame(node.loc.start.line);
            }
        } else if (node.type === 'BlockStatement') {
            this.executeNodes(node.body, ctx);
        }
        // Add more node types as needed
    }

    private evaluateExpression(node: any, ctx: any): any {
        if (!node) return undefined;
        if (node.type === 'Literal') {
            return node.value;
        } else if (node.type === 'Identifier') {
            return ctx.variables[node.name];
        } else if (node.type === 'BinaryExpression') {
            const left = this.evaluateExpression(node.left, ctx);
            const right = this.evaluateExpression(node.right, ctx);
            switch (node.operator) {
                case '+': return left + right;
                case '-': return left - right;
                case '*': return left * right;
                case '/': return left / right;
                case '<': return left < right;
                case '>': return left > right;
                case '<=': return left <= right;
                case '>=': return left >= right;
                case '==': return left == right;
                case '===': return left === right;
                case '!=': return left != right;
                case '!==': return left !== right;
                default: return undefined;
            }
        } else if (node.type === 'UpdateExpression') {
            if (node.argument.type === 'Identifier') {
                let val = ctx.variables[node.argument.name] || 0;
                if (node.operator === '++') val++;
                else if (node.operator === '--') val--;
                ctx.variables[node.argument.name] = val;
                return val;
            }
        }
        return undefined;
    }

    private handleCallExpression(node: any, ctx: any) {
        const { callStack, webApis, microtasks, macrotasks, consoleLogs, captureFrame } = ctx;
        const callee = node.callee;

        // console.log
        if (callee.type === 'MemberExpression' && callee.object.name === 'console' && callee.property.name === 'log') {
            let argText = '';
            if (node.arguments[0]) {
                const evaluated = this.evaluateExpression(node.arguments[0], ctx);
                if (evaluated !== undefined) {
                    argText = String(evaluated);
                } else if (node.arguments[0].type === 'Identifier') {
                    argText = 'undefined';
                } else {
                    argText = node.arguments[0]?.value || node.arguments[0]?.name || node.arguments[0]?.raw || '';
                }
            }
            callStack.push('console.log');
            captureFrame(node.loc.start.line);
            consoleLogs.push(argText);
            callStack.pop();
            captureFrame();
        }
        // setTimeout
        else if (callee.name === 'setTimeout') {
            callStack.push('setTimeout');
            captureFrame(node.loc.start.line);

            // Extract callback name or body and delay
            let cbName = 'anonymous()';
            if (node.arguments[0]) {
                if (node.arguments[0].type === 'Identifier') {
                    cbName = node.arguments[0].name + '()';
                } else if (node.arguments[0].type === 'ArrowFunctionExpression' || node.arguments[0].type === 'FunctionExpression') {
                    cbName = '() => {...}'; // Simplified
                }
            }

            // Extract actual delay if provided, otherwise default to 1 tick
            let delay = 1;
            if (node.arguments[1] && node.arguments[1].type === 'Literal') {
                // Convert ms to generic "ticks" for visualization. E.g. >0 means wait.
                delay = Math.max(1, Math.ceil(node.arguments[1].value / 100)); // Arbitrary scale
            }

            webApis.push({ name: 'setTimeout', remainingTime: delay, callback: cbName });
            callStack.pop();
            captureFrame();
        }
        // Promise.resolve().then()
        else if (callee.type === 'MemberExpression' && callee.property.name === 'then') {
            // Simplified detection for Promise.resolve().then()
            callStack.push('Promise.then');
            captureFrame(node.loc.start.line);

            let cbName = 'anonymous()';
            if (node.arguments[0]) {
                if (node.arguments[0].type === 'Identifier') {
                    cbName = node.arguments[0].name + '()';
                } else if (node.arguments[0].type === 'ArrowFunctionExpression' || node.arguments[0].type === 'FunctionExpression') {
                    cbName = '() => {...}';
                }
            }

            microtasks.push(cbName); // Promise callback
            callStack.pop();
            captureFrame();
        }
    }
}
