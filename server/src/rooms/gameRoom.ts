import { Room, Client } from "@colyseus/core";
import {
  PlayerCrouchSchema,
  PlayerDirectionSchema,
  PlayerFileNameSchema,
  PlayerKeySchema,
  PlayerPositionSchema,
} from "../schema/playerSchema";

import { StateHandlerSchema } from "../schema/stateHandlerSchema";

export class GameRoom extends Room<StateHandlerSchema> {
  public maxClients = 64;

  // When room is initialized
  onCreate(options: any) {
    console.log("GameRoom created!", options);

    //Frequency to send the room state to connected clients. 16ms=60fps.
    this.setPatchRate(16);

    this.setState(new StateHandlerSchema());
  }

  // When client successfully join the room
  onJoin(client: Client) {
    this.onMessage("key", (message) => {
      this.broadcast("key", message);
      console.log(message);
    });

    console.log(`player ${client.sessionId} joined room ${this.roomId}.`);
    this.state.addPlayer(client.sessionId);

    //Update player
    this.onMessage("playerPosition", (client, data: PlayerPositionSchema) => {
      this.state.setPosition(client.sessionId, data);
    });

    this.onMessage("playerDirection", (client, data: PlayerDirectionSchema) => {
      this.state.setDirection(client.sessionId, data);
    });

    this.onMessage("playerCrouching", (client, data: PlayerCrouchSchema) => {
      this.state.setCrouching(client.sessionId, data);
    });

    this.onMessage("playerKey", (client, data: PlayerKeySchema) => {
      this.state.setKeys(client.sessionId, data);
    });

    this.onMessage("playerModelName", (client, data: PlayerFileNameSchema) => {
      this.state.setFileName(client.sessionId, data);
      console.log("client-Id -> ", client.sessionId, "Data", data);
    });
  }

  // When a client leaves the room
  onLeave(client: Client) {
    if (this.state.players.has(client.sessionId)) {
      console.log("This player: " + client.sessionId + " has left.");
      this.state.removePlayer(client.sessionId);
    }
  }

  // Cleanup callback, called after there are no more clients in the room. (see `autoDispose`)
  onDispose() {
    console.log("Dispose GameRoom");
  }
}
