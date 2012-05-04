//requires Sprite.js, inheritance.js

function Character(name,x,y,width,height,sx,sy,sWidth,sHeight,sheet){
	inherit(this,new Sprite(name,x,y,width,height,null,null,MG_DEPTHING,true));

	this.speed = 9;
	this.facing = "Front";
	this.npc = true;
	this.spriteType = "character";

	sWidth = typeof sWidth == "number" ? sWidth : width;
	sHeight = typeof sHeight == "number" ? sHeight : height;

	this.addAnimation(new Animation("idleFront",sheet,sx,sy,sWidth,sHeight,0,1,2));
	this.addAnimation(new Animation("idleRight",sheet,sx,sy,sWidth,sHeight,1,1,2));
	this.addAnimation(new Animation("idleBack",sheet,sx,sy,sWidth,sHeight,2,1,2));
	this.addAnimation(new Animation("idleLeft",sheet,sx,sy,sWidth,sHeight,3,1,2));
	this.addAnimation(new Animation("walkFront",sheet,sx,sy,sWidth,sHeight,4,2,4));
	this.addAnimation(new Animation("walkRight",sheet,sx,sy,sWidth,sHeight,6,2,4));
	this.addAnimation(new Animation("walkBack",sheet,sx,sy,sWidth,sHeight,8,2,4));
	this.addAnimation(new Animation("walkLeft",sheet,sx,sy,sWidth,sHeight,10,2,4));

	this.startAnimation("walkFront");

	this.moveUp = function(room){
		this.facing = "Back";
		this.walk();
		this.tryToMove(0,-this.speed,room);
	}
	this.moveDown = function(room){
		this.facing = "Front";
		this.walk();
		this.tryToMove(0,this.speed,room);
	}
	this.moveLeft = function(room){
		this.facing = "Left";
		this.walk();
		this.tryToMove(-this.speed,0,room);
	}
	this.moveRight = function(room){
		this.facing = "Right";
		this.walk();
		this.tryToMove(this.speed,0,room);
	}

	this.walk = function(){
		this.startAnimation("walk"+this.facing);
	}
	this.idle = function(){
		this.startAnimation("idle"+this.facing);
	}

	this.becomeNPC = function(){
		this.animations.walkFront.frameInterval = 12;
		this.animations.walkBack.frameInterval = 12;
		this.animations.walkLeft.frameInterval = 12;
		this.animations.walkRight.frameInterval = 12;
	}

	this.becomePlayer = function(){
		this.animations.walkFront.frameInterval = 4;
		this.animations.walkBack.frameInterval = 4;
		this.animations.walkLeft.frameInterval = 4;
		this.animations.walkRight.frameInterval = 4;
	}
	
	this.tryToMove = function(vx,vy,room){
	    var i;
	    var moveMap = room.getMoveFunction(this);
	    var wasShifted = false;
	    if(moveMap) { //our motion could be modified somehow
			l = moveMap(vx, vy);
			if(vx!=l.x || vy!=l.y){
				wasShifted = true;
			}
			vx = l.x;
			vy = l.y;
	    }
		this.x += vx;
		this.y += vy;
		if(this.collidable){
			for(var i=0;i<room.sprites.length;i++){
				if(room.sprites[i]!=this){
				    if(this.collides(room.sprites[i])){
						this.x -=vx;
						this.y -=vy;
						return false;
					}
				}
			}
			if(!room.isInBounds(this)){
				if((moveMap && wasShifted) || (!moveMap && room.isBufferable(this))){
					//console.log("no clip!");
					var adjustment = room.getMovementBuffer(this);
					this.x += adjustment.x;
					this.y += adjustment.y;
				}else{
					//console.log("no move!");
					this.x -=vx;
					this.y -=vy;
					return false;
				}
			}
		}
		return true;
	}
	
	this.getActionQueries = function(){
		var queries = new Array();
		if(this.facing=="Front"){
			queries.push({x:this.x,y:this.y+(this.height/2+15)});
			queries.push({x:this.x-this.width/2,y:this.y+(this.height/2+15)});
			queries.push({x:this.x+this.width/2,y:this.y+(this.height/2+15)});
		}else if(this.facing=="Back"){
			queries.push({x:this.x,y:this.y-(this.height/2+15)});
			queries.push({x:this.x-this.width/2,y:this.y-(this.height/2+15)});
			queries.push({x:this.x+this.width/2,y:this.y-(this.height/2+15)});
		}else if(this.facing=="Right"){
			queries.push({x:this.x+(this.width/2+15),y:this.y});
			queries.push({x:this.x+(this.width/2+15),y:this.y+this.height/2});
			queries.push({x:this.x+(this.width/2+15),y:this.y-this.height/2});
		}else if(this.facing=="Left"){
			queries.push({x:this.x-(this.width/2+15),y:this.y});
			queries.push({x:this.x-(this.width/2+15),y:this.y+this.height/2});
			queries.push({x:this.x-(this.width/2+15),y:this.y-this.height/2});
		}
		return queries;
	}
	
	this.serialize = function(output){
		output = output.concat("<Character name='"+this.name+"' x='"+this.x+"' y='"+this.y+
									"' sx='"+this.animations.walkFront.sx+"' sy='"+this.animations.walkFront.sy+
									"' sWidth='"+this.animations.walkFront.colSize+ "' sHeight='"+this.animations.walkFront.rowSize+
									"' width='"+this.width+"' height='"+this.height+
									"' sheet='"+this.animations.walkFront.sheet.name+"' state='"+this.state+"' facing='"+this.facing+"'>");
		//for(var anim in this.animations){
		//	output = this.animations[anim].serialize(output);
		//}
		for(var action in this.actions){
			output = this.actions[action].serialize(output);
		}
		output = output.concat("</Character>");
		return output;
	}

	this.becomeNPC();

}
