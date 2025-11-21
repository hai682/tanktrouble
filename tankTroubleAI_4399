function updateGoal(temp)
{
   if(myGoal.priority < temp.priority)
   {
      myGoal = temp;
   }
}
function dodgeTrajectories(fieldx, fieldy, bullets, maxTimeToDodge, maxDistToDodge, maxCellDistToDodge, hitCheckInterval, checkBounce)
{
   var _loc41_ = maxTimeToDodge;
   var _loc16_ = maxDistToDodge;
   var _loc25_ = {priority:0};
   var _loc21_ = 0;
   var _loc7_;
   var _loc2_;
   var _loc3_;
   var _loc24_;
   var _loc23_;
   var _loc8_;
   var _loc9_;
   var _loc17_;
   var _loc18_;
   var _loc19_;
   var _loc10_;
   var _loc11_;
   var _loc12_;
   var _loc4_;
   var _loc5_;
   var _loc6_;
   var _loc15_;
   var _loc13_;
   var _loc14_;
   while(_loc21_ < bullets.length)
   {
      _loc7_ = bullets[_loc21_];
      _loc2_ = _loc7_.x;
      _loc3_ = _loc7_.y;
      _loc24_ = Math.floor(_loc2_ / _root.SCALE);
      _loc23_ = Math.floor(_loc3_ / _root.SCALE);
      if(_root.distancesForMaze[fieldx][fieldy][_loc24_][_loc23_] <= maxCellDistToDodge)
      {
         _loc8_ = _loc7_.x + _loc7_.xSpeed * hitCheckInterval;
         _loc9_ = _loc7_.y + _loc7_.ySpeed * hitCheckInterval;
         _loc17_ = myTank.x;
         _loc18_ = myTank.y;
         _loc19_ = (_loc8_ - _loc2_) * (_loc8_ - _loc2_) + (_loc9_ - _loc3_) * (_loc9_ - _loc3_);
         _loc10_ = ((_loc17_ - _loc2_) * (_loc8_ - _loc2_) + (_loc18_ - _loc3_) * (_loc9_ - _loc3_)) / _loc19_;
         if(_loc10_ > -1 && _loc10_ < _loc41_)
         {
            _loc11_ = _loc2_ + _loc10_ * (_loc8_ - _loc2_);
            _loc12_ = _loc3_ + _loc10_ * (_loc9_ - _loc3_);
            _loc4_ = _loc17_ - _loc11_;
            _loc5_ = _loc18_ - _loc12_;
            _loc6_ = Math.sqrt(_loc4_ * _loc4_ + _loc5_ * _loc5_);
            _loc15_ = checkPathForCollision(_loc11_,_loc12_,_loc4_ / _loc6_,_loc5_ / _loc6_,1,Math.ceil(_loc6_),Math.ceil(_loc6_));
            if(_loc15_ == undefined && _loc6_ < _loc16_)
            {
               _loc4_ = _loc8_ - _loc11_;
               _loc5_ = _loc9_ - _loc12_;
               _loc13_ = Math.sqrt(_loc4_ * _loc4_ + _loc5_ * _loc5_);
               _loc15_ = checkPathForCollision(_loc11_,_loc12_,_loc4_ / _loc13_,_loc5_ / _loc13_,1,Math.ceil(_loc13_),Math.ceil(_loc13_));
               if(_loc15_ == undefined)
               {
                  _loc16_ = Math.min(_loc16_,_loc6_);
                  _loc25_ = {goal:"dodgeBullet",x:_loc7_.x,y:_loc7_.y,closest:{x:_loc11_,y:_loc12_},dist:_loc6_,t:_loc10_,dir:{x:_loc8_ - _loc2_,y:_loc9_ - _loc3_},maxTime:maxTimeToDodge,maxDist:maxDistToDodge,period:10,priority:1,updateContinuously:false,id:goalId++};
               }
            }
         }
         if(_loc16_ > _root.SCALE / 4 && checkBounce)
         {
            _loc14_ = checkPathForCollision(_loc2_,_loc3_,_loc7_.xSpeed,_loc7_.ySpeed,hitCheckInterval,12,_loc7_.lifetime);
            if(_loc14_ != undefined)
            {
               _loc2_ = _loc14_.x;
               _loc3_ = _loc14_.y;
               _loc8_ = _loc14_.x + _loc14_.xSpeed * hitCheckInterval;
               _loc9_ = _loc14_.y + _loc14_.ySpeed * hitCheckInterval;
               _loc19_ = (_loc8_ - _loc2_) * (_loc8_ - _loc2_) + (_loc9_ - _loc3_) * (_loc9_ - _loc3_);
               _loc10_ = ((_loc17_ - _loc2_) * (_loc8_ - _loc2_) + (_loc18_ - _loc3_) * (_loc9_ - _loc3_)) / _loc19_;
               if(_loc10_ > 0 && _loc10_ < maxTimeToDodge - _loc14_.t)
               {
                  _loc11_ = _loc2_ + _loc10_ * (_loc8_ - _loc2_);
                  _loc12_ = _loc3_ + _loc10_ * (_loc9_ - _loc3_);
                  _loc4_ = _loc17_ - _loc11_;
                  _loc5_ = _loc18_ - _loc12_;
                  _loc6_ = Math.sqrt(_loc4_ * _loc4_ + _loc5_ * _loc5_);
                  _loc15_ = checkPathForCollision(_loc11_,_loc12_,_loc4_ / _loc6_,_loc5_ / _loc6_,1,Math.ceil(_loc6_),Math.ceil(_loc6_));
                  if(_loc15_ == undefined && _loc6_ < _loc16_)
                  {
                     _loc4_ = _loc11_ - _loc2_;
                     _loc5_ = _loc12_ - _loc3_;
                     _loc13_ = Math.sqrt(_loc4_ * _loc4_ + _loc5_ * _loc5_);
                     _loc15_ = checkPathForCollision(_loc2_,_loc3_,_loc4_ / _loc13_,_loc5_ / _loc13_,1,Math.ceil(_loc13_),Math.ceil(_loc13_));
                     if(_loc15_ == undefined)
                     {
                        _loc16_ = Math.min(_loc16_,_loc6_);
                        _loc25_ = {goal:"dodgeBullet",x:_loc7_.x,y:_loc7_.y,closest:{x:_loc11_,y:_loc12_},dist:_loc6_,t:_loc10_ + _loc14_.t,dir:{x:_loc8_ - _loc2_,y:_loc9_ - _loc3_},maxTime:maxTimeToDodge,maxDist:maxDistToDodge,period:10,priority:1,updateContinuously:false,id:goalId++};
                     }
                  }
               }
            }
         }
      }
      _loc21_ = _loc21_ + 1;
   }
   return _loc25_;
}
function tryToRetaliate()
{
   if(currentAggresiveness < AGGRESIVENESS / 2)
   {
      return undefined;
   }
   var _loc14_;
   var _loc12_;
   var _loc13_;
   var _loc11_;
   var _loc10_;
   var _loc4_;
   var _loc5_;
   var _loc6_;
   var _loc3_;
   var _loc7_;
   var _loc2_;
   switch(myTank.currentWeapon)
   {
      case "bullet":
      case "laser":
         if(myTank.bulletsFired < _root.settingsMaxBullets)
         {
            _loc14_ = myTank._rotation;
            _loc12_ = false;
            _loc13_ = _root.BULLETLIFETIME;
            _loc11_ = _root.MOVIEWIDTH + _root.MOVIEHEIGHT;
            _loc10_ = checkBulletPath(_loc14_);
            if(_loc10_.result == "HIT")
            {
               _loc12_ = true;
               if(_loc10_.time < _loc13_)
               {
                  _loc13_ = _loc10_.time;
                  _loc11_ = 0;
               }
            }
            else if(_loc10_.result == "NOTHING" && !_loc12_)
            {
               if(_loc10_.closest < _loc11_)
               {
                  _loc11_ = _loc10_.closest;
               }
            }
            if(_loc12_ || _loc11_ < MAXCLOSESTDISTANCE / 2)
            {
               trace("Retaliate!");
               myActionsForGoal.push({action:"fireWeapon",delay:1});
               currentAggresiveness = Math.max(0,currentAggresiveness - 0.2);
            }
         }
         break;
      case "frag":
         if(myTank.fragFired)
         {
            _loc4_ = myTank.lastFrag;
            _loc5_ = myTank.x - _loc4_.x;
            _loc6_ = myTank.y - _loc4_.y;
            _loc3_ = Math.sqrt(_loc5_ * _loc5_ + _loc6_ * _loc6_);
            _loc7_ = checkPathForCollision(_loc4_.x,_loc4_.y,_loc5_ / _loc3_,_loc6_ / _loc3_,1,Math.ceil(_loc3_),Math.ceil(_loc3_));
            if(_loc7_ != undefined || _loc3_ >= FRAGBOMBSAFETYDIST)
            {
               _loc2_ = 0;
               while(true)
               {
                  if(_loc2_ >= _root.TANKS)
                  {
                     return;
                  }
                  if(_root.game["tank" + _loc2_].alive && _root.game["tank" + _loc2_] != myTank)
                  {
                     _loc5_ = _root.game["tank" + _loc2_].x - _loc4_.x;
                     _loc6_ = _root.game["tank" + _loc2_].y - _loc4_.y;
                     _loc3_ = Math.sqrt(_loc5_ * _loc5_ + _loc6_ * _loc6_);
                     if(_loc3_ <= FRAGBOMBDETONATEDIST)
                     {
                        _loc7_ = checkPathForCollision(_loc4_.x,_loc4_.y,_loc5_ / _loc3_,_loc6_ / _loc3_,1,Math.ceil(_loc3_),Math.ceil(_loc3_));
                        if(_loc7_ == undefined)
                        {
                           myActionsForGoal.push({action:"fireWeapon",delay:1});
                        }
                     }
                  }
                  _loc2_ = _loc2_ + 1;
               }
            }
         }
         break;
      case "gatling":
   }
}
function checkPathForCollision(x, y, xSpeed, ySpeed, hitCheckInterval, maxtime, lifetime)
{
   lifetime = Math.min(maxtime,lifetime);
   t = 0;
   while(lifetime > 0)
   {
      i = 0;
      while(i < hitCheckInterval)
      {
         previousX = x;
         previousY = y;
         x += xSpeed;
         y += ySpeed;
         if(_root.game.mazemc.hitTest(_root.game._x + x,_root.game._y + y,true))
         {
            x = previousX;
            y = previousY;
            x -= xSpeed;
            y += ySpeed;
            if(_root.game.mazemc.hitTest(_root.game._x + x,_root.game._y + y,true))
            {
               hitOnXInvert = true;
            }
            else
            {
               hitOnXInvert = false;
            }
            x = previousX;
            y = previousY;
            x += xSpeed;
            y -= ySpeed;
            if(_root.game.mazemc.hitTest(_root.game._x + x,_root.game._y + y,true))
            {
               hitOnYInvert = true;
            }
            else
            {
               hitOnYInvert = false;
            }
            if(hitOnXInvert && !hitOnYInvert)
            {
               ySpeed = - ySpeed;
            }
            else if(hitOnYInvert && !hitOnXInvert)
            {
               xSpeed = - xSpeed;
            }
            else
            {
               xSpeed = - xSpeed;
               ySpeed = - ySpeed;
            }
            x = previousX;
            y = previousY;
            x += xSpeed;
            y += ySpeed;
            return {x:x,y:y,xSpeed:xSpeed,ySpeed:ySpeed,t:t};
         }
         i++;
      }
      lifetime = lifetime - 1;
      t++;
   }
   return undefined;
}
function checkBulletPath(angle)
{
   var _loc2_ = myTank._x + Math.cos((angle - 90) * 3.141593 / 180) * _root.SCALE * 4.5 / 16;
   var _loc3_ = myTank._y + Math.sin((angle - 90) * 3.141593 / 180) * _root.SCALE * 4.5 / 16;
   var _loc4_ = Math.cos((angle - 90) * 3.141593 / 180) * _root.BULLETSPEED * (_root.SCALE / 50);
   var _loc5_ = Math.sin((angle - 90) * 3.141593 / 180) * _root.BULLETSPEED * (_root.SCALE / 50);
   var _loc7_ = _root.BULLETLIFETIME / 3;
   var _loc11_ = _root.BULLETDEADLY;
   var _loc10_ = _root.MOVIEWIDTH + _root.MOVIEHEIGHT;
   var _loc6_;
   var _loc9_;
   var _loc8_;
   while(_loc7_ > 0)
   {
      i = 0;
      while(i < 1)
      {
         previousX = _loc2_;
         previousY = _loc3_;
         _loc2_ += _loc4_;
         _loc3_ += _loc5_;
         if(_root.game.mazemc.hitTest(_root.game._x + _loc2_,_root.game._y + _loc3_,true))
         {
            _loc2_ = previousX;
            _loc3_ = previousY;
            _loc2_ -= _loc4_;
            _loc3_ += _loc5_;
            if(_root.game.mazemc.hitTest(_root.game._x + _loc2_,_root.game._y + _loc3_,true))
            {
               hitOnXInvert = true;
            }
            else
            {
               hitOnXInvert = false;
            }
            _loc2_ = previousX;
            _loc3_ = previousY;
            _loc2_ += _loc4_;
            _loc3_ -= _loc5_;
            if(_root.game.mazemc.hitTest(_root.game._x + _loc2_,_root.game._y + _loc3_,true))
            {
               hitOnYInvert = true;
            }
            else
            {
               hitOnYInvert = false;
            }
            if(hitOnXInvert && !hitOnYInvert)
            {
               _loc5_ = - _loc5_;
            }
            else if(hitOnYInvert && !hitOnXInvert)
            {
               _loc4_ = - _loc4_;
            }
            else
            {
               _loc4_ = - _loc4_;
               _loc5_ = - _loc5_;
            }
            _loc2_ = previousX;
            _loc3_ = previousY;
            _loc2_ += _loc4_;
            _loc3_ += _loc5_;
         }
         i++;
      }
      if(_loc11_ == 0)
      {
         var i = 0;
         while(i < _root.TANKS)
         {
            if(_root.game["tank" + i].alive && _root.game["tank" + i].hitTest(_root.game._x + _loc2_,_root.game._y + _loc3_,false))
            {
               if(_root.game["tank" + i].hitTest(_root.game._x + _loc2_,_root.game._y + _loc3_,true))
               {
                  if(_root.game["tank" + i] == myTank)
                  {
                     return {result:"SUICIDE",time:_root.BULLETLIFETIME / 3 - _loc7_};
                  }
                  return {result:"HIT",time:_root.BULLETLIFETIME / 3 - _loc7_};
               }
            }
            else if(_root.game["tank" + i].alive && _root.game["tank" + i] != myTank)
            {
               _loc6_ = Math.abs(_root.game["tank" + i].x - _loc2_) + Math.abs(_root.game["tank" + i].y - _loc3_);
               if(_loc6_ < MAXCLOSESTDISTANCE)
               {
                  _loc9_ = Math.floor(_loc2_ / _root.SCALE);
                  _loc8_ = Math.floor(_loc3_ / _root.SCALE);
                  if(_root.distancesForMaze[_root.tankFields[i].x][_root.tankFields[i].y][_loc9_][_loc8_] <= MAXCLOSESTCELLDISTANCE)
                  {
                     if(_loc6_ < _loc10_)
                     {
                        _loc10_ = _loc6_;
                     }
                  }
               }
            }
            i++;
         }
      }
      if(_loc11_ > 0)
      {
         _loc11_ = _loc11_ - 1;
      }
      _loc7_ = _loc7_ - 1;
   }
   return {result:"NOTHING",time:_root.BULLETLIFETIME / 3,closest:_loc10_};
}
function pushActionsToFollowPath(path)
{
   var _loc2_ = path.length - 1;
   while(_loc2_ >= 1)
   {
      myActionsForGoal.push({action:"driveToField",x:path[_loc2_].x,y:path[_loc2_].y});
      _loc2_ = _loc2_ - 1;
   }
   var _loc6_;
   var _loc5_;
   var _loc4_;
   if(path.length > 1)
   {
      _loc6_ = myTank._rotation;
      _loc4_ = {x:(path[1].x + 0.5) * _root.SCALE - myTank._x,y:(path[1].y + 0.5) * _root.SCALE - myTank._y};
      if(_loc4_.x != 0)
      {
         if(_loc4_.x > 0)
         {
            _loc5_ = 90 + Math.atan(_loc4_.y / _loc4_.x) * 180 / 3.141593;
         }
         else
         {
            _loc5_ = -90 + Math.atan(_loc4_.y / _loc4_.x) * 180 / 3.141593;
         }
      }
      else if(_loc4_.y > 0)
      {
         _loc5_ = 180;
      }
      else if(_loc4_.y < 0)
      {
         _loc5_ = 0;
      }
      else
      {
         _loc5_ = _loc6_;
      }
   }
   myActionsForGoal.push({action:"driveToPos",x:(path[0].x + 0.5) * _root.SCALE,y:(path[0].y + 0.5) * _root.SCALE,canReverse:path.length <= 2});
}
function makeDecisionsAndUpdateGoal()
{
   if(myGoal.period > 0)
   {
      myGoal.period--;
      return myGoal.updateContinuously;
   }
   myGoal.priority *= 0.9;
   oldGoal = myGoal;
   var _loc10_ = Math.floor(myTank._x / _root.SCALE);
   var _loc9_ = Math.floor(myTank._y / _root.SCALE);
   var _loc28_;
   var _loc40_;
   var _loc7_;
   var _loc12_;
   var _loc24_;
   var _loc25_;
   var _loc26_;
   var _loc3_;
   if(_root.aliveCount > 1 && myTank.currentWeapon == "bullet")
   {
      _loc28_ = new Array();
      for(var _loc48_ in _root.game.mazebg)
      {
         if(substring(_loc48_,0,5) == "crate")
         {
            _loc28_.push(_root.game.mazebg[_loc48_]);
         }
      }
      _loc40_ = MAXCELLDISTTOGOFORCRATE;
      _loc7_ = {priority:0};
      _loc12_ = 0;
      while(_loc12_ < _loc28_.length)
      {
         _loc24_ = _loc28_[_loc12_];
         _loc25_ = Math.floor(_loc24_._x / _root.SCALE);
         _loc26_ = Math.floor(_loc24_._y / _root.SCALE);
         _loc3_ = _root.distancesForMaze[_loc10_][_loc9_][_loc25_][_loc26_];
         if(_loc3_ <= _loc40_)
         {
            _loc40_ = _loc3_;
            _loc7_ = {goal:"goForCrate",x:_loc25_,y:_loc26_,period:10,priority:(MAXCELLDISTTOGOFORCRATE - _loc3_) / MAXCELLDISTTOGOFORCRATE * GREEDY * (_root.settingsMaxBullets - myTank.bulletsFired) / _root.settingsMaxBullets,updateContinuously:false,id:goalId++};
         }
         _loc12_ = _loc12_ + 1;
      }
      updateGoal(_loc7_);
   }
   var _loc38_ = new Array();
   for(var _loc47_ in _root.game)
   {
      if(substring(_loc47_,0,6) == "bullet")
      {
         _loc38_.push(_root.game[_loc47_]);
      }
   }
   _loc7_ = dodgeTrajectories(_loc10_,_loc9_,_loc38_,MAXTIMETODODGEBULLET,MAXDISTTODODGEBULLET,MAXCELLDISTTODODGEBULLET,_root.BULLETHITCHECKINTERVALS,true);
   updateGoal(_loc7_);
   var _loc27_ = new Array();
   var _loc46_ = new Array();
   for(var _loc49_ in _root.game)
   {
      if(substring(_loc49_,0,4) == "frag")
      {
         if(substring(_loc49_,0,12) == "fragfragment")
         {
            if(_root.game[_loc49_].active)
            {
               _loc46_.push(_root.game[_loc49_]);
            }
         }
         else
         {
            _loc27_.push(_root.game[_loc49_]);
         }
      }
   }
   var _loc15_ = MAXCELLDISTTODODGEFRAGBOMB;
   _loc12_ = 0;
   var _loc11_;
   var _loc29_;
   var _loc31_;
   while(_loc12_ < _loc27_.length)
   {
      _loc11_ = _loc27_[_loc12_];
      _loc29_ = Math.floor(_loc11_.x / _root.SCALE);
      _loc31_ = Math.floor(_loc11_.y / _root.SCALE);
      _loc3_ = _root.distancesForMaze[_loc10_][_loc9_][_loc29_][_loc31_];
      if(_loc3_ < _loc15_)
      {
         _loc15_ = _loc3_;
         _loc7_ = {goal:"dodgeFragbomb",frag:_loc11_,period:10,priority:1,updateContinuously:false,id:goalId++};
      }
      _loc12_ = _loc12_ + 1;
   }
   updateGoal(_loc7_);
   _loc7_ = dodgeTrajectories(_loc10_,_loc9_,_loc46_,MAXTIMETODODGEFRAGBOMBFRAGMENT,MAXDISTTODODGEFRAGBOMBFRAGMENT,MAXCELLDISTTODODGEFRAGBOMBFRAGMENT,_root.FRAGHITCHECKINTERVALS,false);
   updateGoal(_loc7_);
   _loc38_ = new Array();
   for(_loc47_ in _root.game)
   {
      if(substring(_loc47_,0,13) == "gatlingBullet")
      {
         _loc38_.push(_root.game[_loc47_]);
      }
   }
   _loc7_ = dodgeTrajectories(_loc10_,_loc9_,_loc38_,MAXTIMETODODGEGATLINGBULLET,MAXDISTTODODGEGATLINGBULLET,MAXCELLDISTTODODGEGATLINGBULLET,_root.GATLINGHITCHECKINTERVALS,true);
   updateGoal(_loc7_);
   _loc15_ = MAXCELLDISTTODODGELASER;
   _loc7_ = {priority:0};
   _loc12_ = 0;
   var _loc2_;
   var _loc32_;
   var _loc30_;
   var _loc16_;
   var _loc13_;
   var _loc14_;
   var _loc18_;
   var _loc19_;
   var _loc34_;
   var _loc36_;
   var _loc37_;
   var _loc17_;
   var _loc33_;
   var _loc35_;
   while(_loc12_ < _root.TANKS)
   {
      if(_root.game["tank" + _loc12_].alive && _root.game["tank" + _loc12_].currentEquipment == "aimer" && _root.game["tank" + _loc12_] != myTank)
      {
         _loc2_ = _root.game["tank" + _loc12_].equipment;
         if(_loc2_.hit == myTank)
         {
            _loc15_ = 0;
            _loc7_ = {goal:"dodgeLaser",dir:{x:_loc2_.hitXSpeed,y:_loc2_.hitYSpeed},owner:_root.game["tank" + _loc12_],period:10,priority:1,updateContinuously:false,id:goalId++};
         }
         else if(_loc2_.hit == undefined)
         {
            _loc32_ = Math.floor((_loc2_._x + _loc2_.x) / _root.SCALE);
            _loc30_ = Math.floor((_loc2_._y + _loc2_.y) / _root.SCALE);
            _loc3_ = _root.distancesForMaze[_loc10_][_loc9_][_loc32_][_loc30_];
            if(_loc3_ <= _loc15_)
            {
               _loc16_ = checkPathForCollision(_loc2_._x + _loc2_.x,_loc2_._y + _loc2_.y,_loc2_.xSpeed,_loc2_.ySpeed,_root.AIMERHITCHECKINTERVALS,12,12);
               if(_loc16_ != undefined)
               {
                  _loc13_ = _loc2_._x + _loc2_.x;
                  _loc14_ = _loc2_._y + _loc2_.y;
                  _loc18_ = _loc16_.x;
                  _loc19_ = _loc16_.y;
                  _loc34_ = myTank.x;
                  _loc36_ = myTank.y;
                  _loc37_ = (_loc18_ - _loc13_) * (_loc18_ - _loc13_) + (_loc19_ - _loc14_) * (_loc19_ - _loc14_);
                  _loc17_ = ((_loc34_ - _loc13_) * (_loc18_ - _loc13_) + (_loc36_ - _loc14_) * (_loc19_ - _loc14_)) / _loc37_;
                  if(_loc17_ > 0 && _loc17_ < 1)
                  {
                     _loc33_ = Math.floor((_loc13_ + _loc17_ * (_loc18_ - _loc13_)) / _root.SCALE);
                     _loc35_ = Math.floor((_loc14_ + _loc17_ * (_loc19_ - _loc14_)) / _root.SCALE);
                     _loc3_ = _root.distancesForMaze[_loc10_][_loc9_][_loc33_][_loc35_];
                     if(_loc3_ <= _loc15_)
                     {
                        _loc15_ = _loc3_;
                        _loc7_ = {goal:"dodgeLaser",dir:{x:_loc16_.xSpeed,y:_loc16_.ySpeed},owner:_root.game["tank" + _loc12_],period:10,priority:1,updateContinuously:false,id:goalId++};
                     }
                  }
               }
               else
               {
                  _loc15_ = _loc3_;
                  _loc7_ = {goal:"dodgeLaser",dir:{x:_loc2_.xSpeed,y:_loc2_.ySpeed},owner:_root.game["tank" + _loc12_],period:10,priority:1,updateContinuously:false,id:goalId++};
               }
            }
         }
      }
      _loc12_ = _loc12_ + 1;
   }
   updateGoal(_loc7_);
   var _loc8_;
   var _loc22_;
   var _loc23_;
   var _loc39_;
   loop18:
   switch(myTank.currentWeapon)
   {
      case "bullet":
      case "laser":
         if(myTank.bulletsFired < _root.settingsMaxBullets || myTank.currentWeapon == "laser")
         {
            _loc12_ = 0;
            while(_loc12_ < _root.TANKS)
            {
               if(_root.game["tank" + _loc12_].alive && _root.game["tank" + _loc12_] != myTank)
               {
                  _loc8_ = _root.getShortestPathWithDistances(_root.maze,_root.distancesForMaze[_loc10_][_loc9_],_loc10_,_loc9_,_root.tankFields[_loc12_].x,_root.tankFields[_loc12_].y);
                  if(_loc8_.length < LONGESTPATHTOSHOOT)
                  {
                     _loc7_ = {goal:"shootAfter",target:_root.game["tank" + _loc12_],period:10,priority:(_loc8_.length > LONGESTPATHTONOTHESITATETOSHOOT ? (LONGESTPATHTOSHOOT - _loc8_.length) / LONGESTPATHTOSHOOT * currentAggresiveness : 1),updateContinuously:false,id:goalId++};
                     updateGoal(_loc7_);
                  }
               }
               _loc12_ = _loc12_ + 1;
            }
         }
         break;
      case "frag":
         if(!myTank.fragFired)
         {
            _loc12_ = 0;
            while(true)
            {
               if(_loc12_ >= _root.TANKS)
               {
                  break loop18;
               }
               if(_root.game["tank" + _loc12_].alive && _root.game["tank" + _loc12_] != myTank)
               {
                  _loc8_ = _root.getShortestPathWithDistances(_root.maze,_root.distancesForMaze[_loc10_][_loc9_],_loc10_,_loc9_,_root.tankFields[_loc12_].x,_root.tankFields[_loc12_].y);
                  if(_loc8_.length < LONGESTPATHTOSHOOT)
                  {
                     _loc7_ = {goal:"shootAfter",target:_root.game["tank" + _loc12_],period:10,priority:(_loc8_.length > LONGESTPATHTONOTHESITATETOSHOOT ? (LONGESTPATHTOSHOOT - _loc8_.length) / LONGESTPATHTOSHOOT * currentAggresiveness : 1),updateContinuously:false,id:goalId++};
                     updateGoal(_loc7_);
                  }
               }
               _loc12_ = _loc12_ + 1;
            }
            break;
         }
         _loc11_ = myTank.lastFrag;
         _loc22_ = myTank.x - _loc11_.x;
         _loc23_ = myTank.y - _loc11_.y;
         _loc3_ = Math.sqrt(_loc22_ * _loc22_ + _loc23_ * _loc23_);
         _loc39_ = checkPathForCollision(_loc11_.x,_loc11_.y,_loc22_ / _loc3_,_loc23_ / _loc3_,1,Math.ceil(_loc3_),Math.ceil(_loc3_));
         if(_loc39_ != undefined || _loc3_ >= FRAGBOMBSAFETYDIST)
         {
            _loc12_ = 0;
            while(_loc12_ < _root.TANKS)
            {
               if(_root.game["tank" + _loc12_].alive && _root.game["tank" + _loc12_] != myTank)
               {
                  _loc22_ = _root.game["tank" + _loc12_].x - _loc11_.x;
                  _loc23_ = _root.game["tank" + _loc12_].y - _loc11_.y;
                  _loc3_ = Math.sqrt(_loc22_ * _loc22_ + _loc23_ * _loc23_);
                  if(_loc3_ <= FRAGBOMBDETONATEDIST)
                  {
                     _loc39_ = checkPathForCollision(_loc11_.x,_loc11_.y,_loc22_ / _loc3_,_loc23_ / _loc3_,1,Math.ceil(_loc3_),Math.ceil(_loc3_));
                     if(_loc39_ == undefined)
                     {
                        _loc7_ = {goal:"detonate",period:1,priority:1,updateContiuously:false,id:goalId++};
                        updateGoal(_loc7_);
                     }
                  }
               }
               _loc12_ = _loc12_ + 1;
            }
         }
         break;
      case "gatling":
         if(myTank.gatlingReady)
         {
            _loc12_ = 0;
            while(_loc12_ < _root.TANKS)
            {
               if(_root.game["tank" + _loc12_].alive && _root.game["tank" + _loc12_] != myTank)
               {
                  _loc8_ = _root.getShortestPathWithDistances(_root.maze,_root.distancesForMaze[_loc10_][_loc9_],_loc10_,_loc9_,_root.tankFields[_loc12_].x,_root.tankFields[_loc12_].y);
                  if(_loc8_.length < LONGESTPATHTOSHOOT)
                  {
                     _loc7_ = {goal:"sprayBullets",target:_root.game["tank" + _loc12_],period:15,priority:(_loc8_.length > LONGESTPATHTONOTHESITATETOSHOOT ? (LONGESTPATHTOSHOOT - _loc8_.length) / LONGESTPATHTOSHOOT * currentAggresiveness : 1),updateContinuously:false,id:goalId++};
                     updateGoal(_loc7_);
                  }
               }
               _loc12_ = _loc12_ + 1;
            }
         }
   }
   var _loc5_;
   var _loc6_;
   var _loc4_;
   var _loc21_;
   if(_root.aliveCount > 1 && myTank.currentWeapon == "bullet" && myTank.bulletsFired == _root.settingsMaxBullets)
   {
      _loc5_ = new Array(_root.maze.length - 1);
      _loc12_ = 0;
      while(_loc12_ < _loc5_.length)
      {
         _loc5_[_loc12_] = new Array(_root.maze[_loc12_].length - 1);
         _loc12_ = _loc12_ + 1;
      }
      _loc6_ = 0;
      while(_loc6_ < _loc5_.length)
      {
         _loc4_ = 0;
         while(_loc4_ < _loc5_[0].length)
         {
            _loc5_[_loc6_][_loc4_] = 0;
            _loc4_ = _loc4_ + 1;
         }
         _loc6_ = _loc6_ + 1;
      }
      _loc12_ = 0;
      while(_loc12_ < _root.TANKS)
      {
         if(_root.game["tank" + _loc12_].alive && _root.game["tank" + _loc12_] != myTank && _root.game["tank" + _loc12_].bulletsFired != _root.settingsMaxBullets)
         {
            _loc21_ = _root.distancesForMaze[_root.tankFields[_loc12_].x][_root.tankFields[_loc12_].y];
            _loc6_ = 0;
            while(_loc6_ < _loc5_.length)
            {
               _loc4_ = 0;
               while(_loc4_ < _loc5_[0].length)
               {
                  _loc5_[_loc6_][_loc4_] += _loc21_[_loc6_][_loc4_];
                  _loc4_ = _loc4_ + 1;
               }
               _loc6_ = _loc6_ + 1;
            }
         }
         _loc12_ = _loc12_ + 1;
      }
      if(_loc5_[_loc10_][_loc9_] < LONGESTPATHTORUN)
      {
         _loc7_ = {goal:"runAway",dist:_loc5_,period:10,priority:(LONGESTPATHTORUN - _loc5_[_loc10_][_loc9_]) / LONGESTPATHTORUN * COWARDNESS * (myTank.bulletsFired / _root.settingsMaxBullets),updateContinuously:false,id:goalId++};
         updateGoal(_loc7_);
      }
   }
   if(myTank.hitSomething)
   {
      stuckTime = Math.min(stuckTime + 1,MAXSTUCKTIME);
   }
   else
   {
      stuckTime = 0;
   }
   _loc7_ = {goal:"backAway",period:5,priority:stuckTime / (MAXSTUCKTIME - 0.1),updateContinuously:false,id:goalId++};
   updateGoal(_loc7_);
   var _loc20_;
   if(_root.aliveCount > 1)
   {
      _loc20_ = random(_root.TANKS);
      while(_root.game["tank" + _loc20_] == myTank || !_root.game["tank" + _loc20_].alive)
      {
         _loc20_ = random(_root.TANKS);
      }
      if(_root.game["tank" + _loc20_] != myTank)
      {
         _loc7_ = {goal:"driveTo",period:10,priority:IDLEDRIVETOWARDENEMYPRIORITY,x:_root.tankFields[_loc20_].x,y:_root.tankFields[_loc20_].y,updateContinuously:false,id:goalId++};
         updateGoal(_loc7_);
      }
   }
   if(oldGoal.id != myGoal.id)
   {
      switch(myGoal.goal)
      {
         case "shootAfter":
            trace("Goal: Shoot after " + myGoal.target);
            currentAggresiveness = Math.max(0,currentAggresiveness - 0.2);
            break;
         case "sprayBullets":
            trace("Goal: Spray bullets at " + myGoal.target);
            currentAggresiveness = Math.max(0,currentAggresiveness - 0.1);
            break;
         case "detonate":
            currentAggresiveness = Math.max(0,currentAggresiveness - 0.1);
            break;
         case "runAway":
            trace("Goal: Run away");
            break;
         case "driveTo":
            trace("Goal: Drive to " + myGoal.x + ", " + myGoal.y);
            break;
         case "dodgeBullet":
            trace("Goal: Dodge bullet at " + myGoal.x + ", " + myGoal.y);
            break;
         case "backAway":
         case "dodgeFragbomb":
         case "dodgeLaser":
         case "driveAfter":
         case "goForCrate":
      }
      return true;
   }
   currentAggresiveness = Math.min(AGGRESIVENESS,currentAggresiveness + AGGRESIVENESS / 50);
   return myGoal.updateContinuously;
}
function decideActionsToAchieveGoal()
{
   myActionsForGoal = new Array();
   var _loc10_ = Math.floor(myTank._x / _root.SCALE);
   var _loc11_ = Math.floor(myTank._y / _root.SCALE);
   var _loc4_;
   var _loc8_;
   var _loc7_;
   var _loc6_;
   var _loc2_;
   var _loc12_;
   var _loc13_;
   var _loc19_;
   var _loc28_;
   var _loc5_;
   var _loc3_;
   var _loc17_;
   var _loc14_;
   var _loc9_;
   var _loc26_;
   var _loc24_;
   var _loc20_;
   var _loc21_;
   var _loc18_;
   var _loc16_;
   var _loc15_;
   var _loc27_;
   var _loc25_;
   var _loc22_;
   var _loc23_;
   var _loc29_;
   var _loc30_;
   switch(myGoal.goal)
   {
      case "shootAfter":
         _loc4_ = myTank._rotation;
         _loc8_ = false;
         _loc7_ = _root.BULLETLIFETIME;
         _loc6_ = _root.MOVIEWIDTH + _root.MOVIEHEIGHT;
         _loc2_ = myTank._rotation;
         _loc12_ = myGoal.target.x - myTank.x;
         _loc13_ = myGoal.target.y - myTank.y;
         _loc19_ = Math.sqrt(_loc12_ * _loc12_ + _loc13_ * _loc13_);
         _loc28_ = checkPathForCollision(myTank.x,myTank.y,_loc12_ / _loc19_,_loc13_ / _loc19_,1,Math.ceil(_loc19_),Math.ceil(_loc19_));
         if(_loc28_ == undefined)
         {
            _loc8_ = true;
            _loc6_ = 0;
            if(_loc12_ != 0)
            {
               if(_loc12_ > 0)
               {
                  _loc4_ = 90 + Math.atan(_loc13_ / _loc12_) * 180 / 3.141593;
               }
               else
               {
                  _loc4_ = -90 + Math.atan(_loc13_ / _loc12_) * 180 / 3.141593;
               }
            }
            else if(_loc13_ > 0)
            {
               _loc4_ = 180;
            }
            else if(_loc13_ < 0)
            {
               _loc4_ = 0;
            }
            else
            {
               _loc4_ = _loc2_;
            }
            trace("Set shot to be a direct hitter with angle " + _loc4_);
         }
         if(!_loc8_)
         {
            _loc5_ = 1;
            while(_loc5_ <= 3)
            {
               _loc3_ = checkBulletPath(_loc2_);
               if(_loc3_.result == "HIT")
               {
                  _loc8_ = true;
                  if(_loc3_.time < _loc7_)
                  {
                     _loc7_ = _loc3_.time;
                     _loc6_ = 0;
                     _loc4_ = _loc2_;
                  }
               }
               else if(_loc3_.result == "NOTHING" && !_loc8_)
               {
                  if(_loc3_.closest < _loc6_)
                  {
                     _loc6_ = _loc3_.closest;
                     _loc4_ = _loc2_;
                  }
               }
               if(Math.random() < 0.5)
               {
                  _loc2_ += myTank.turnSpeed * _loc5_ * _loc5_;
               }
               else
               {
                  _loc2_ -= myTank.turnSpeed * _loc5_ * _loc5_;
               }
               if(_loc2_ < -180)
               {
                  _loc2_ = 360 + _loc2_;
               }
               if(_loc2_ > 180)
               {
                  _loc2_ -= 360;
               }
               _loc5_ = _loc5_ + 1;
            }
         }
         trace(myTank.currentWeapon);
         if(_loc8_ || _loc6_ < MAXCLOSESTDISTANCE / (myTank.currentWeapon != "laser" ? 1 : 2))
         {
            myActionsForGoal.push({action:"fireWeapon",delay:5});
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
         }
         else if(_loc4_ != myTank._rotation)
         {
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
         }
         else
         {
            _loc4_ = myTank._rotation + 180;
            if(_loc4_ > 180)
            {
               _loc4_ -= 360;
            }
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
         }
         break;
      case "sprayBullets":
         _loc4_ = myTank._rotation;
         _loc8_ = false;
         _loc7_ = _root.GATLINGLIFETIME;
         _loc6_ = _root.MOVIEWIDTH + _root.MOVIEHEIGHT;
         _loc2_ = myTank._rotation;
         _loc5_ = 1;
         while(_loc5_ <= 3)
         {
            _loc3_ = checkBulletPath(_loc2_);
            if(_loc3_.result == "HIT")
            {
               _loc8_ = true;
               if(_loc3_.time < _loc7_)
               {
                  _loc7_ = _loc3_.time;
                  _loc6_ = 0;
                  _loc4_ = _loc2_;
               }
            }
            else if(_loc3_.result == "NOTHING" && !foundGoodShot)
            {
               if(_loc3_.closest < _loc6_)
               {
                  _loc6_ = _loc3_.closest;
                  _loc4_ = _loc2_;
               }
            }
            if(Math.random() < 0.5)
            {
               _loc2_ += myTank.turnSpeed * _loc5_ * _loc5_;
            }
            else
            {
               _loc2_ -= myTank.turnSpeed * _loc5_ * _loc5_;
            }
            if(_loc2_ < -180)
            {
               _loc2_ = 360 + _loc2_;
            }
            if(_loc2_ > 180)
            {
               _loc2_ -= 360;
            }
            _loc5_ = _loc5_ + 1;
         }
         if(_loc8_ || _loc6_ < MAXCLOSESTDISTANCE)
         {
            myActionsForGoal.push({action:"fireWeapon",delay:75});
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
         }
         else if(_loc4_ != myTank._rotation)
         {
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
         }
         else
         {
            _loc4_ = myTank._rotation + 180;
            if(_loc4_ > 180)
            {
               _loc4_ -= 360;
            }
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
         }
         break;
      case "detonate":
         myActionsForGoal.push({action:"fireWeapon",delay:1});
         break;
      case "driveTo":
         _loc17_ = _root.distancesForMaze[_loc10_][_loc11_];
         _loc14_ = _root.getShortestPathWithDistances(_root.maze,_loc17_,_loc10_,_loc11_,myGoal.x,myGoal.y);
         pushActionsToFollowPath(_loc14_);
         break;
      case "runAway":
         _loc17_ = myGoal.dist;
         _loc9_ = _root.followGradientPathWithDistancesAndDeadEnds(_root.maze,_loc17_,_root.deadEnds,_loc10_,_loc11_,5);
         pushActionsToFollowPath(_loc9_);
         break;
      case "backAway":
         myActionsForGoal.push({action:"driveToPos",x:(_loc10_ + 0.5) * _root.SCALE,y:(_loc11_ + 0.5) * _root.SCALE,canReverse:false});
         if(myTank.expandedHitCheck(myTank.hitPointsFront,1.1))
         {
            if(myTank.expandedHitCheck(myTank.hitPointsRear,1.1))
            {
               if(myTank.expandedHitCheck(myTank.hitPointsLeft,1.3))
               {
                  myActionsForGoal.push({action:"backupAndTurn",dist:5,dir:"left"});
               }
               else
               {
                  myActionsForGoal.push({action:"backupAndTurn",dist:5,dir:"right"});
               }
            }
            else
            {
               myActionsForGoal.push({action:"backup",dist:3});
            }
         }
         else if(myTank.expandedHitCheck(myTank.hitPointsRear,1.1))
         {
            if(myTank.expandedHitCheck(myTank.hitPointsFront,1.1))
            {
               if(myTank.expandedHitCheck(myTank.hitPointsLeft,1.3))
               {
                  myActionsForGoal.push({action:"backupAndTurn",dist:5,dir:"left"});
               }
               else
               {
                  myActionsForGoal.push({action:"backupAndTurn",dist:5,dir:"right"});
               }
            }
            else
            {
               myActionsForGoal.push({action:"forward",dist:3});
            }
         }
         else
         {
            myActionsForGoal.push({action:"backup",dist:3});
         }
         break;
      case "dodgeBullet":
         _loc26_ = Math.floor(myGoal.x / _root.SCALE);
         _loc24_ = Math.floor(myGoal.y / _root.SCALE);
         _loc9_ = _root.followGradientPathWithDistancesAndDeadEnds(_root.maze,_root.distancesForMaze[_loc26_][_loc24_],_root.deadEnds,_loc10_,_loc11_,5);
         if(myGoal.t < myGoal.maxTime / 3 && myGoal.dist < myGoal.maxDist / 5 || _loc9_.length <= 1)
         {
            if(_loc9_.length <= 1 && !(myGoal.t < myGoal.maxTime / 3 && myGoal.dist < myGoal.maxDist / 5))
            {
               trace("I was cornered!");
            }
            _loc20_ = myTank._rotation;
            if(myGoal.dir.x != 0)
            {
               if(myGoal.dir.x > 0)
               {
                  _loc4_ = 90 + Math.atan(myGoal.dir.y / myGoal.dir.x) * 180 / 3.141593;
               }
               else
               {
                  _loc4_ = -90 + Math.atan(myGoal.dir.y / myGoal.dir.x) * 180 / 3.141593;
               }
            }
            else if(myGoal.dir.y > 0)
            {
               _loc4_ = 180;
            }
            else if(myGoal.dir.y < 0)
            {
               _loc4_ = 0;
            }
            else
            {
               _loc4_ = _loc20_;
            }
            if(Math.abs(_loc4_ - _loc20_) > 90 && Math.abs(_loc4_ - _loc20_) < 270)
            {
               _loc4_ += 180;
               if(_loc4_ > 180)
               {
                  _loc4_ -= 360;
               }
            }
            _loc4_ = Math.round(_loc4_ / myTank.turnSpeed) * myTank.turnSpeed;
            myActionsForGoal.push({action:"turnTo",angle:_loc4_});
            if(myGoal.dist < _root.SCALE / 4)
            {
               _loc21_ = Math.sqrt(myGoal.dir.x * myGoal.dir.x + myGoal.dir.y * myGoal.dir.y);
               _loc18_ = {x:(- myGoal.dir.y) / _loc21_,y:myGoal.dir.x / _loc21_};
               _loc16_ = {x:myGoal.closest.x + _loc18_.x * _root.SCALE / 2,y:myGoal.closest.y + _loc18_.y * _root.SCALE / 2};
               _loc15_ = {x:myGoal.closest.x - _loc18_.x * _root.SCALE / 2,y:myGoal.closest.y - _loc18_.y * _root.SCALE / 2};
               _loc27_ = Math.sqrt((myTank.x - _loc16_.x) * (myTank.x - _loc16_.x) + (myTank.y - _loc16_.y) * (myTank.y - _loc16_.y));
               _loc25_ = Math.sqrt((myTank.x - _loc15_.x) * (myTank.x - _loc15_.x) + (myTank.y - _loc15_.y) * (myTank.y - _loc15_.y));
               if(_loc27_ < _loc25_)
               {
                  myActionsForGoal.push({action:"driveToPos",x:_loc16_.x,y:_loc16_.y,canReverse:true});
               }
               else
               {
                  myActionsForGoal.push({action:"driveToPos",x:_loc15_.x,y:_loc15_.y,canReverse:true});
               }
            }
         }
         else
         {
            pushActionsToFollowPath(_loc9_);
         }
         tryToRetaliate();
         break;
      case "dodgeFragbomb":
         _loc22_ = Math.floor(myGoal.frag.x / _root.SCALE);
         _loc23_ = Math.floor(myGoal.frag.y / _root.SCALE);
         _loc9_ = _root.followGradientPathWithDistancesAndDeadEnds(_root.maze,_root.distancesForMaze[_loc22_][_loc23_],_root.deadEnds,_loc10_,_loc11_,5);
         if(_loc9_.length > 1)
         {
            pushActionsToFollowPath(_loc9_);
         }
         else
         {
            _loc9_ = _root.followGradientPathWithDistances(_root.maze,_root.distancesForMaze[_loc22_][_loc23_],_loc10_,_loc11_,5);
            pushActionsToFollowPath(_loc9_);
         }
         tryToRetaliate();
         break;
      case "dodgeLaser":
         _loc29_ = Math.floor(myGoal.owner.x / _root.SCALE);
         _loc30_ = Math.floor(myGoal.owner.y / _root.SCALE);
         _loc9_ = _root.followGradientPathWithDistancesAndDeadEnds(_root.maze,_root.distancesForMaze[_loc29_][_loc30_],_root.deadEnds,_loc10_,_loc11_,2);
         pushActionsToFollowPath(_loc9_);
         tryToRetaliate();
         break;
      case "goForCrate":
         _loc17_ = _root.distancesForMaze[_loc10_][_loc11_];
         _loc14_ = _root.getShortestPathWithDistances(_root.maze,_loc17_,_loc10_,_loc11_,myGoal.x,myGoal.y);
         myActionsForGoal.push({action:"driveToPos",x:(_loc14_[_loc14_.length - 1].x + 0.5) * _root.SCALE,y:(_loc14_[_loc14_.length - 1].y + 0.5) * _root.SCALE,canReverse:true});
         pushActionsToFollowPath(_loc14_);
         break;
      case "idle":
         myActionsForGoal.push({action:"idle"});
      default:
         return;
   }
}
function setInputToDoActions()
{
   var _loc7_ = Math.floor(myTank._x / _root.SCALE);
   var _loc6_ = Math.floor(myTank._y / _root.SCALE);
   action = myActionsForGoal.pop();
   switch(action.action)
   {
      case "driveToField":
         if(Math.abs(myTank._x - (action.x + 0.5) * _root.SCALE) > _root.SCALE / 3 || Math.abs(myTank._y - (action.y + 0.5) * _root.SCALE) > _root.SCALE / 3)
         {
            myActionsForGoal.push(action);
         }
         break;
      case "turnTo":
         if(Math.abs(myTank._rotation - action.angle) >= myTank.turnSpeed)
         {
            myActionsForGoal.push(action);
         }
         break;
      case "fireWeapon":
         if(action.delay != 0)
         {
            action.delay--;
            myActionsForGoal.push(action);
         }
         break;
      case "driveToPos":
         if(Math.abs(myTank._x - action.x) > _root.SCALE / 4 || Math.abs(myTank._y - action.y) > _root.SCALE / 4)
         {
            myActionsForGoal.push(action);
         }
         break;
      case "forward":
         if(action.dist != 0)
         {
            action.dist--;
            myActionsForGoal.push(action);
         }
         break;
      case "forwardAndTurn":
         if(action.dist != 0)
         {
            action.dist--;
            myActionsForGoal.push(action);
         }
      case "backup":
         if(action.dist != 0)
         {
            action.dist--;
            myActionsForGoal.push(action);
         }
         break;
      case "backupAndTurn":
         if(action.dist != 0)
         {
            action.dist--;
            myActionsForGoal.push(action);
         }
         break;
      case "idle":
         myActionsForGoal.push(action);
   }
   action = myActionsForGoal[myActionsForGoal.length - 1];
   var _loc3_;
   var _loc2_;
   var _loc5_;
   var _loc4_;
   switch(action.action)
   {
      case "driveToField":
         _loc3_ = myTank._rotation;
         if(_loc7_ > action.x)
         {
            _loc2_ = -90;
         }
         else if(_loc7_ < action.x)
         {
            _loc2_ = 90;
         }
         else if(_loc6_ > action.y)
         {
            _loc2_ = 0;
         }
         else if(_loc6_ < action.y)
         {
            _loc2_ = 180;
         }
         else
         {
            _loc2_ = _loc3_;
         }
         if(_loc2_ > _loc3_)
         {
            if(Math.abs(_loc2_ - _loc3_) > 180)
            {
               myTank.turnLeft = true;
               myTank.turnRight = false;
            }
            else
            {
               myTank.turnLeft = false;
               myTank.turnRight = true;
            }
         }
         else if(_loc2_ < _loc3_)
         {
            if(Math.abs(_loc2_ - _loc3_) > 180)
            {
               myTank.turnLeft = false;
               myTank.turnRight = true;
            }
            else
            {
               myTank.turnLeft = true;
               myTank.turnRight = false;
            }
         }
         else
         {
            myTank.turnLeft = false;
            myTank.turnRight = false;
         }
         if(Math.abs(_loc2_ - _loc3_) > 90 && Math.abs(_loc2_ - _loc3_) < 270)
         {
            myTank.forward = false;
            myTank.backup = false;
         }
         else
         {
            myTank.forward = true;
            myTank.backup = false;
         }
         myTank.fire = false;
         return;
      case "turnTo":
         _loc3_ = myTank._rotation;
         _loc2_ = action.angle;
         if(_loc2_ > _loc3_)
         {
            if(Math.abs(_loc2_ - _loc3_) > 180)
            {
               myTank.turnLeft = true;
               myTank.turnRight = false;
            }
            else
            {
               myTank.turnLeft = false;
               myTank.turnRight = true;
            }
         }
         else if(_loc2_ < _loc3_)
         {
            if(Math.abs(_loc2_ - _loc3_) > 180)
            {
               myTank.turnLeft = false;
               myTank.turnRight = true;
            }
            else
            {
               myTank.turnLeft = true;
               myTank.turnRight = false;
            }
         }
         else
         {
            myTank.turnLeft = false;
            myTank.turnRight = false;
         }
         myTank.forward = false;
         myTank.backup = false;
         myTank.fire = false;
         return;
      case "fireWeapon":
         myTank.turnLeft = false;
         myTank.turnRight = false;
         myTank.forward = false;
         myTank.backup = false;
         myTank.fire = true;
         return;
      case "driveToPos":
         _loc3_ = myTank._rotation;
         _loc5_ = false;
         _loc4_ = {x:action.x - myTank._x,y:action.y - myTank._y};
         if(_loc4_.x != 0)
         {
            if(_loc4_.x > 0)
            {
               _loc2_ = 90 + Math.atan(_loc4_.y / _loc4_.x) * 180 / 3.141593;
            }
            else
            {
               _loc2_ = -90 + Math.atan(_loc4_.y / _loc4_.x) * 180 / 3.141593;
            }
         }
         else if(_loc4_.y > 0)
         {
            _loc2_ = 180;
         }
         else if(_loc4_.y < 0)
         {
            _loc2_ = 0;
         }
         else
         {
            _loc2_ = _loc3_;
         }
         _loc2_ = myTank.turnSpeed * Math.round(_loc2_ / myTank.turnSpeed);
         if(action.canReverse)
         {
            if(Math.abs(_loc2_ - _loc3_) > 90 && Math.abs(_loc2_ - _loc3_) < 270)
            {
               _loc5_ = true;
               _loc2_ += 180;
               if(_loc2_ > 180)
               {
                  _loc2_ -= 360;
               }
            }
         }
         if(_loc2_ > _loc3_)
         {
            if(Math.abs(_loc2_ - _loc3_) > 180)
            {
               myTank.turnLeft = Math.abs(_loc2_ - _loc3_) < 360 - myTank.turnSpeed ? true : false;
               myTank.turnRight = false;
            }
            else
            {
               myTank.turnLeft = false;
               myTank.turnRight = Math.abs(_loc2_ - _loc3_) > myTank.turnSpeed ? true : false;
            }
         }
         else if(_loc2_ < _loc3_)
         {
            if(Math.abs(_loc2_ - _loc3_) > 180)
            {
               myTank.turnLeft = false;
               myTank.turnRight = Math.abs(_loc2_ - _loc3_) < 360 - myTank.turnSpeed ? true : false;
            }
            else
            {
               myTank.turnLeft = Math.abs(_loc2_ - _loc3_) > myTank.turnSpeed ? true : false;
               myTank.turnRight = false;
            }
         }
         else
         {
            myTank.turnLeft = false;
            myTank.turnRight = false;
         }
         if(Math.abs(_loc2_ - _loc3_) > 45 && Math.abs(_loc2_ - _loc3_) < 315)
         {
            myTank.forward = false;
            myTank.backup = false;
         }
         else
         {
            myTank.forward = !_loc5_;
            myTank.backup = _loc5_;
         }
         myTank.fire = false;
         return;
      case "forward":
         myTank.turnLeft = false;
         myTank.turnRight = false;
         myTank.forward = true;
         myTank.backup = false;
         myTank.fire = false;
         return;
      case "forwardAndTurn":
         myTank.turnLeft = action.dir == "left";
         myTank.turnRight = action.dir == "right";
         myTank.forward = true;
         myTank.backup = false;
         myTank.fire = false;
         return;
      case "backup":
         myTank.turnLeft = false;
         myTank.turnRight = false;
         myTank.forward = false;
         myTank.backup = true;
         myTank.fire = false;
         return;
      case "backupAndTurn":
         myTank.turnLeft = action.dir == "left";
         myTank.turnRight = action.dir == "right";
         myTank.forward = false;
         myTank.backup = true;
         myTank.fire = false;
         return;
      case "idle":
         myTank.turnLeft = false;
         myTank.turnRight = false;
         myTank.forward = false;
         myTank.backup = false;
         myTank.fire = false;
         return;
      default:
         myTank.turnLeft = false;
         myTank.turnRight = false;
         myTank.forward = false;
         myTank.backup = false;
         myTank.fire = false;
         myGoal.period = 0;
         return;
   }
}
var myTank;
var myGoal = {goal:"idle",priority:0,period:15,id:0,updateContinuously:true};
var myActionsForGoal;
AGGRESIVENESS = 0.5;
COWARDNESS = 0.7;
GREEDY = 1;
LONGESTPATHTOSHOOT = 7;
LONGESTPATHTONOTHESITATETOSHOOT = 2;
FRAGBOMBSAFETYDIST = 3 * _root.SCALE;
FRAGBOMBDETONATEDIST = 3 * _root.SCALE;
LONGESTPATHTORUN = 10;
MAXSTUCKTIME = 1;
stuckTime = 0;
currentAggresiveness = AGGRESIVENESS;
IDLEDRIVETOWARDENEMYPRIORITY = 0.1;
IDLEDRIVEPRIORITY = 0.1;
MAXCLOSESTCELLDISTANCE = 2;
MAXCLOSESTDISTANCE = _root.SCALE * MAXCLOSESTCELLDISTANCE;
MAXTIMETODODGEBULLET = 75;
MAXDISTTODODGEBULLET = 4 * _root.SCALE;
MAXCELLDISTTODODGEBULLET = MAXTIMETODODGEBULLET * _root.BULLETSPEED / 50;
MAXCELLDISTTODODGEFRAGBOMB = 5;
MAXTIMETODODGEFRAGBOMBFRAGMENT = 50;
MAXDISTTODODGEFRAGBOMBFRAGMENT = 3 * _root.SCALE;
MAXCELLDISTTODODGEFRAGBOMBFRAGMENT = MAXTIMETODODGEFRAGBOMBFRAGMENT * (_root.FRAGSPEED + 4) / 50;
MAXTIMETODODGEGATLINGBULLET = 75;
MAXDISTTODODGEGATLINGBULLET = 3 * _root.SCALE;
MAXCELLDISTTODODGEGATLINGBULLET = MAXTIMETODODGEGATLINGBULLET * _root.GATLINGSPEED / 50;
MAXCELLDISTTODODGELASER = 2;
MAXCELLDISTTOGOFORCRATE = 10;
var goalId = 1;
