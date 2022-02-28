const CracoLessPlugin = require("craco-less");
const path = require("path");

module.exports = {
    plugins: [
        {
            plugin: CracoLessPlugin,
            options: {
                lessLoaderOptions: {
                    lessOptions: {
                        modifyVars: { "@primary-color": "#f00" },
                        javascriptEnabled: true,
                    },
                },
            },
        },
    ],
    webpack: {
        alias: {
            "@": path.join(path.resolve(__dirname, "./src")),
        },
    },
};
