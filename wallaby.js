// eslint-disable-next-line no-undef
module.exports = function (wallaby) {
    return {
        files: [
            './src/**/*.ts',
            './src/assets/**/*'
        ],
        tests: [
            './test/**/*.ts'
        ],
        env: {
            type: 'node',
        },
        runMode: 'onSave'
    };
};
