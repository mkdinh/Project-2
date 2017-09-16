// -------------------------------------------------------------------------------------------
// INITALIZING GAME STATE 
// -------------------------------------------------------------------------------------------
// setting up rpg canvas by declaring single rpg state with div id='rpg'

var LoM = LoM || {};

LoM.Town = function(){};

LoM.Town = {
    // -------------------------------------------------------------------------------------------
    // INITALIZING GAME STATE
    // -------------------------------------------------------------------------------------------
    // allow Town to run in the background
    init:function(){
        this.stage.disableVisibilityChange = true;
    },
    

    // -------------------------------------------------------------------------------------------
    // CREATE GAME STATE
    // -------------------------------------------------------------------------------------------    
    create: function(){
        // GAME VIEWS INITIALIZATION
        // -----------------------------------------------------------
        // setting updating frequency to lighten load on socket IO
        this.world.setBounds(0, 0, 950, 1583)
	    this.time.advancedTiming = true;
        this.time.desiredFps = 40;
        this.time.suggestedFps = 40;
        $("body").css('background-color','#000000');
        this.stage.backgroundColor = '#000000';
        // setting object reference to be used in other functions object
        game = this;

        // event handling boolean
        this.eventActive = this.eventActive || {};
        this.eventActive.state = false;

        // object for storing battle info
        this.battleInfo = {}

        // generate data map
        this.groupMap = {}
        this.spriteMap = {}

        // setting a higher hierachy object for userInfo to reference to
        LoM.userInfo = this.userInfo;
 
        // generate children objects for this.groupMap and this.spriteMap
        // this allow any element generated by the game to be trackable and refer to later
        // look at generator.js for details
        if(Object.keys(this.groupMap).length === 0){
            LoM.generator.genDataMap(['tileMap','layers','collisions','players','npcs','enemies','objects']);
        
            // Generate Layer Collisions
            // -----------------------------------------------------------------------
            
            // set collision events for the game for user interactions with an array of tile index

            LoM.generator.genLayerCollisions('Houses','wallCollisions',
                [124,104,84,64,44,45,46,47,48,49,50,69,89,109,129,149,169,148,147,146,145,344,324,304,284,264,244,225,206,227,248,269,289,309,329,349,368,327,326,325,1612,1613,1592,1572,1552,1532,1512,1493,1474,1475,1496,1517,1537,1557,1577,1597,1617],
                LoM.interaction.wallCollisions
            ); 

            LoM.generator.genLayerCollisions('Houses','shop',
                [1595],
                LoM.interaction.shopInteractions
            )
            LoM.generator.genLayerCollisions('Houses','inn',
                [166,167],
                LoM.interaction.innInteractions
            )
            LoM.generator.genLayerCollisions('Houses','trainers',
                [355,356,357],
                LoM.interaction.trainerInteractions
            )

            LoM.generator.genLayerCollisions('castle-entrance','castleInteractions',
            [550],
            LoM.interaction.castleInteractions
            );     
        }
        // generate all online users accessing the game
        // use initial array if playerMaster is empty, else use playerMaster object
        // to generate players
        if(Object.keys(LoM.playerMaster).length > 0){
            for(player in LoM.playerMaster){
                // console.log(player)
                if(LoM.playerMaster[player].world.state === 'Town'){
                    LoM.player.add(LoM.playerMaster[player])
                    // console.log(LoM.playerMaster[player])
                }
            }
        }
        else{
            // console.log(LoM.playerArray)
            for(i = 0; i < LoM.playerArray.length;i++){
                if(LoM.playerArray[i].world.state === 'Town'){
                    LoM.player.add(LoM.playerArray[i])
                    // console.log(LoM.playerArray[i])
                }
            }
        }

        // generate npc on town map
        var sprite2Info = {
            id: '1',
            sprite: "npc-1",
            role: 'npc',
            name: 'Mysterious Stranger',
            velocity: {x: -10, y: 0},
            world: {x: 390,y:280,state:'Town'}
        }

        // create a sprite with npc info
        LoM.player.add(sprite2Info);
        this.sprite2 = this.groupMap.npcs['sample'];

        // after all players is load for the current user, the game start
        // this prevent update from running before all the players is loaded
        initialized = true;
    },

    // -------------------------------------------------------------------------------------------
    // UPDATING GAME STATE
    // -------------------------------------------------------------------------------------------    
    update: function(){
        // if all player data is loaded, start the game update
        if(initialized){
            // always listen to building collisions
            this.physics.arcade.collide(this.groupMap.players, this.spriteMap.collisions['wallCollisions'],this.spriteMap.collisions['wallCollisions'].data['onCollide'], null, this);
            
            this.checkLayerCollisions();
            
            // update world position    
            var worldX = LoM.spriteMaster[LoM.userInfo.id].x;
            var worldY = LoM.spriteMaster[LoM.userInfo.id].y;

            // update world position 
            LoM.playerControl.eventListener(worldX,worldY);

            // listen for key press for character movement and pass that information to socket.io
            // if the last key pressed was 100ms ago, then listen stop updating to server 
            LoM.playerControl.controlInput(worldX,worldY);
        }
    },

    render: function(){
    },

    randomInt: function (low,high){
        return Math.floor(Math.random() * (high - low) + low);
    },

    checkLayerCollisions: function(){
        // listen to player-npc and player-player interactions
        // this.physics.arcade.collide(this.groupMap.players, this.groupMap.players, this.spriteCollisions, null, this);
        this.physics.arcade.collide(this.groupMap.players, this.groupMap.npcs, this.npcInteractions, null, this);
        // listen for collision interactions
        for(var collision in this.spriteMap.collisions){
            this.physics.arcade.collide(LoM.spriteMaster[LoM.userInfo.id], this.spriteMap.collisions[collision], 
                this.spriteMap.collisions[collision].data['onCollide'],null, this);
        }
    }
}





