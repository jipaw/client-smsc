module.exports = {
    server: {
        app: {
            slogan: 'NSMSC SERVER'
        }
    },
    connections: [{
            port: 8009,
            labels: ['http-client']
        }
    ],
    registrations: [{
            plugin: 'inert',
            options: {
                select: ['http-client']
            }
        },
        {
            plugin: 'vision',
            options: {
                select: ['http-client']

            }
        },
        {
            plugin: {
                register: 'good',
                options: {
                    reporters: {
                        myConsoleReport: [{
                                module: 'good-squeeze',
                                name: 'Squeeze',
                                args: [{
                                    log: '*',
                                    response: '*'
                                }]
                            },
                            {
                                module: 'good-console'
                            },
                            'stdout'
                        ]
                    }
                }
            }
        },
        {
            plugin: './module/sms/index',
            options: {
                select: ['http-client']
            }
        }
    ]
}
