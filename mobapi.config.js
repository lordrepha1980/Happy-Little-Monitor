module.exports = {
    apps : [{
        name   : "Monitor",
        script : "DEBUG=app:* node ./app.js",
        noAutorestart: true,
        max_memory_restart: "130M",
        watch  : true,
        ignore_watch: [
            "server/database/MongoDB/dataApi/*",
            "server/database/customApi/*",
            "server/database/MongoDB/dataApi/get/*",
            "server/database/customApi/get/*",
            "server/database/MongoDB/dataApi/post/*",
            "server/database/customApi/post/*",
            "node_modules"
        ]
    }]
}