import { spawn } from 'child_process';
import svelte from 'rollup-plugin-svelte';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import resolve from '@rollup/plugin-node-resolve';
import livereload from 'rollup-plugin-livereload';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';

const production = !process.env.ROLLUP_WATCH;
const basePath = production ? '/grably-frontend' : '';

function serve() {
    let server;

    function toExit() {
        if (server) server.kill(0);
    }

    return {
        writeBundle() {
            if (server) return;
            server = spawn('npm', ['run', 'start', '--', '--dev', '--single'], {
                stdio: ['ignore', 'inherit', 'inherit'],
                shell: true
            });

            process.on('SIGTERM', toExit);
            process.on('exit', toExit);
        }
    };
}

export default {
    input: 'src/main.js',
    output: {
        sourcemap: true,
        format: 'iife',
        name: 'app',
        file: 'public/build/bundle.js'
    },
    plugins: [
        replace({
            'process.env.BASE_PATH': JSON.stringify(basePath),
            preventAssignment: true
        }),
        svelte({
            compilerOptions: {
                dev: !production
            }
        }),
        css({ output: 'bundle.css' }),
        resolve({
            browser: true,
            dedupe: ['svelte'],
            exportConditions: ['svelte']
        }),
        commonjs(),
        !production && serve(),
        !production && livereload({
            watch: 'public',
            port: 35729,
            exclusions: ['**/node_modules/**']
        }),
        production && terser()
    ],
    watch: {
        clearScreen: false
    }
};