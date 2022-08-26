/* eslint-disable no-await-in-loop */
/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path')

const replaceInFiles = require('replace-in-files')

async function main() {
    const keys = Object.keys(process.env)
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index]
        await replaceInFiles({
            files: join(__dirname, `./generated/${process.env.BRANCH_NAME}/**`),
            from: new RegExp(`%${key}%`, 'g'),
            to: process.env[key],
        })
    }
}

;(async () => {
    await main()
})()
