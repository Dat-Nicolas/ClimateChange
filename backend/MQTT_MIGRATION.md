# MQTT Integration - Migration Guide

This document explains the migration from Socket.io WebSockets to MQTT for real-time AC device communication.

## Changes Made

### 1. Replaced Socket.io with MQTT
- **Before**: Used NestJS WebSocket Gateway with Socket.io for real-time communication
- **After**: Uses MQTT protocol with dedicated MQTT client for IoT device communication

### 2. Dependencies
**Removed:**
- `@nestjs/platform-socket.io`
- `@nestjs/websockets`
- `socket.io`

**Added:**
- `mqtt` (v5.10.0)

### 3. MQTT Topics

The system uses the following MQTT topic structure:

#### Command Topics
```
ac/{roomId}/command
```
- **Direction**: Server → Devices
- **QoS**: 1 (At least once delivery)
- **Retain**: false
- **Payload**: JSON command object

Example:
```json
{
  "protocol": "ir_protocol",
  "payload": {
    "status": "on",
    "temp": 24,
    "mode": "cool"
  }
}
```

#### Status Topics
```
ac/{roomId}/status
```
- **Direction**: Devices → Server
- **QoS**: 1
- **Retain**: true (Last message is retained)
- **Payload**: JSON status object

Example:
```json
{
  "status": "on",
  "currentTemp": 22,
  "mode": "cool",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### 4. Configuration

Set the following environment variables in your `.env` file:

```env
# MQTT Configuration
MQTT_URL=mqtt://localhost:1883
MQTT_USER=user
MQTT_PASSWORD=password
```

**Defaults:**
- `MQTT_URL`: `mqtt://localhost:1883`
- `MQTT_USER`: `user`
- `MQTT_PASSWORD`: `password`

### 5. AcGateway Methods

The `AcGateway` service now provides:

#### `emitCommand(roomId: string, command: any)`
Sends a command to devices in a specific room.
- Includes anti-spam logic to prevent duplicate commands
- Publishes to `ac/{roomId}/command` topic

```typescript
acGateway.emitCommand('room-123', {
  protocol: 'ir_protocol',
  payload: { status: 'on', temp: 24, mode: 'cool' }
});
```

#### `publishStatus(roomId: string, status: any)`
Publishes status updates from devices.
- Uses retained messages for last-known status
- Publishes to `ac/{roomId}/status` topic

```typescript
acGateway.publishStatus('room-123', {
  status: 'on',
  currentTemp: 22,
  mode: 'cool'
});
```

#### `subscribe(topic: string, callback?: (message: string) => void)`
Subscribe to MQTT topics.

```typescript
acGateway.subscribe('ac/room-123/status', (message) => {
  console.log('Status received:', message);
});
```

#### `unsubscribe(topic: string)`
Unsubscribe from MQTT topics.

#### `getClient(): mqtt.MqttClient`
Get the raw MQTT client for advanced operations.

### 6. Benefits of MQTT over WebSockets

1. **IoT-Native**: MQTT is the standard protocol for IoT devices
2. **Better for Devices**: Lower overhead, better battery efficiency
3. **Publish-Subscribe**: Decoupled communication between server and devices
4. **Retained Messages**: Devices can see the last state on reconnection
5. **QoS Levels**: Guaranteed message delivery
6. **Scalability**: Better for large numbers of devices

### 7. Setup Instructions

1. **Install MQTT Broker** (Mosquitto recommended)
   ```bash
   # Docker
   docker run -it -p 1883:1883 -p 9001:9001 eclipse-mosquitto:latest
   
   # Or install locally (macOS)
   brew install mosquitto
   ```

2. **Install Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your MQTT broker details
   ```

4. **Start Server**
   ```bash
   npm run start:dev
   ```

### 8. Testing

Test MQTT functionality using `mosquitto_pub` and `mosquitto_sub`:

```bash
# Subscribe to status messages
mosquitto_sub -h localhost -u user -P password -t 'ac/+/status'

# Publish a command
mosquitto_pub -h localhost -u user -P password -t 'ac/room-123/command' -m '{"status":"on","temp":24,"mode":"cool"}'
```

### 9. Future Improvements

- Add TypeScript interfaces for command and status payloads
- Implement message validation/schema validation
- Add metrics and monitoring for MQTT messages
- Consider MQTT over WebSocket (ws/wss) for web clients if needed
- Add device authentication via client certificates
