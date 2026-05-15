import {

    Injectable,
    OnModuleInit,
    OnModuleDestroy

} from '@nestjs/common';

import * as mqtt from 'mqtt';
import { ButtonACCommand } from './dto/ac-control.dto';

@Injectable()

export class AcGateway
implements
    OnModuleInit,
    OnModuleDestroy
{
    // ====================================
    // MQTT CLIENT
    // ====================================

    private client!: mqtt.MqttClient;

    // ====================================
    // ANTI SPAM
    // ====================================

    private lastState = new Map();

    // ====================================
    // CALLBACKS
    // ====================================

    private callbacks = new Map<
        string,
        (message: string) => void
    >();

    // ====================================
    // ENV
    // ====================================

    private readonly MQTT_URL =
        process.env.MQTT_URL || '';

    private readonly MQTT_USER =
        process.env.MQTT_USER || '';

    private readonly MQTT_PASSWORD =
        process.env.MQTT_PASSWORD || '';

    // ====================================
    // INIT
    // ====================================

    async onModuleInit() {

        await this.connectMqtt();
    }

    // ====================================
    // DESTROY
    // ====================================

    async onModuleDestroy() {

        if (
            this.client &&
            this.client.connected
        ) {

            await new Promise<void>(
                (resolve) => {

                    this.client.end(

                        false,

                        () => {

                            console.log(
                                'MQTT DISCONNECTED'
                            );

                            resolve();
                        }
                    );
                }
            );
        }
    }

    // ====================================
    // CONNECT MQTT
    // ====================================

    private connectMqtt(): Promise<void> {

        return new Promise((resolve) => {

            console.log(
                'MQTT CONNECTING...'
            );

            console.log(
                this.MQTT_URL
            );

            // ================================
            // CONNECT
            // ================================

            this.client = mqtt.connect({

                host: this.MQTT_URL,

                port: 8883,

                protocol: 'mqtts',

                username: this.MQTT_USER,

                password: this.MQTT_PASSWORD,

                reconnectPeriod: 5000,

                connectTimeout: 10000,

                clean: true,

                clientId:

                    `nestjs_${Math.random()
                        .toString(16)
                        .slice(2)}`
            });

            // ================================
            // TIMEOUT
            // ================================

            const timeout = setTimeout(() => {

                console.log(
                    'MQTT TIMEOUT'
                );

                resolve();

            }, 12000);

            // ================================
            // CONNECTED
            // ================================

            this.client.on(

                'connect',

                () => {

                    clearTimeout(
                        timeout
                    );

                    console.log(
                        'MQTT CONNECTED'
                    );

                    resolve();
                }
            );

            // ================================
            // ERROR
            // ================================

            this.client.on(

                'error',

                (err) => {

                    console.log(
                        'MQTT ERROR'
                    );

                    console.log(
                        err.message
                    );
                }
            );

            // ================================
            // RECONNECT
            // ================================

            this.client.on(

                'reconnect',

                () => {

                    console.log(
                        'MQTT RECONNECTING...'
                    );
                }
            );

            // ================================
            // OFFLINE
            // ================================

            this.client.on(

                'offline',

                () => {

                    console.log(
                        'MQTT OFFLINE'
                    );
                }
            );

            // ================================
            // MESSAGE
            // ================================

            this.client.on(

                'message',

                (
                    topic,
                    message
                ) => {

                    console.log(
                        `MQTT MESSAGE: ${topic}`
                    );

                    const callback =
                        this.callbacks.get(
                            topic
                        );

                    if (callback) {

                        callback(

                            message.toString()
                        );
                    }
                }
            );
        });
    }

    // ====================================
    // EMIT COMMAND
    // ====================================

    emitCommand(

        roomId: string,

        command: ButtonACCommand
    ) {

        const prev =
            this.lastState.get(
                roomId
            );

        // ================================
        // SKIP SAME
        // ================================

        if (

            prev &&

            JSON.stringify(prev)
            ===
            JSON.stringify(command)
        ) {

            console.log(
                'SKIP SAME COMMAND'
            );

            return;
        }

        // ================================
        // SAVE STATE
        // ================================

        this.lastState.set(

            roomId,

            command
        );

        // ================================
        // TOPIC
        // ================================

        const topic =

            `room/${roomId}/ac/command`;

        const payload =

            JSON.stringify(command);

        // ================================
        // CHECK MQTT
        // ================================

        if (

            !this.client ||

            !this.client.connected
        ) {

            console.log(
                'MQTT NOT CONNECTED'
            );

            return;
        }

        // ================================
        // PUBLISH
        // ================================

        this.client.publish(

            topic,

            payload,

            {

                qos: 1,

                retain: false
            },

            (err) => {

                if (err) {

                    console.log(
                        'MQTT PUBLISH ERROR'
                    );

                    console.log(err);

                    return;
                }

                console.log(
                    'COMMAND EMITTED'
                );

                console.log(
                    topic
                );

                console.log(
                    payload
                );
            }
        );
    }

    // ====================================
    // PUBLISH STATUS
    // ====================================

    publishStatus(

        roomId: string,

        status: any
    ) {

        const topic =

            `room/${roomId}/ac/status`;

        const payload =

            JSON.stringify(status);

        if (

            !this.client ||

            !this.client.connected
        ) {

            console.log(
                'MQTT NOT CONNECTED'
            );

            return;
        }

        this.client.publish(

            topic,

            payload,

            {

                qos: 1,

                retain: true
            },

            (err) => {

                if (err) {

                    console.log(
                        'STATUS PUBLISH ERROR'
                    );

                    console.log(err);

                    return;
                }

                console.log(
                    'STATUS PUBLISHED'
                );

                console.log(
                    topic
                );
            }
        );
    }

    // ====================================
    // SUBSCRIBE
    // ====================================

    subscribe(

        topic: string,

        callback?: (
            message: string
        ) => void
    ) {

        if (!this.client) {

            console.log(
                'MQTT NOT INITIALIZED'
            );

            return;
        }

        // ================================
        // SAVE CALLBACK
        // ================================

        if (callback) {

            this.callbacks.set(

                topic,

                callback
            );
        }

        // ================================
        // SUBSCRIBE
        // ================================

        this.client.subscribe(

            topic,

            {

                qos: 1
            },

            (err) => {

                if (err) {

                    console.log(
                        'SUBSCRIBE ERROR'
                    );

                    console.log(err);

                    return;
                }

                console.log(
                    `SUBSCRIBED: ${topic}`
                );
            }
        );
    }

    // ====================================
    // UNSUBSCRIBE
    // ====================================

    unsubscribe(
        topic: string
    ) {

        if (!this.client) {

            return;
        }

        this.client.unsubscribe(

            topic,

            (err) => {

                if (err) {

                    console.log(
                        'UNSUBSCRIBE ERROR'
                    );

                    console.log(err);

                    return;
                }

                console.log(
                    `UNSUBSCRIBED: ${topic}`
                );
            }
        );

        // ================================
        // REMOVE CALLBACK
        // ================================

        this.callbacks.delete(
            topic
        );
    }

    // ====================================
    // GET CLIENT
    // ====================================

    getClient() {

        return this.client;
    }
}