void Box2() {
  BB(70, 170);
  motorStop();
  delay(120);
  spinDegree(-90);
  motorStop();
  delay(120);
  SetBack(25);
  motorStop();
  delay(100);
  //////////////////////
  FF(100, 335);
  motorStop();
  delay(150);
  spinDegree(-90);
  motorStop();
  delay(120);
  /////////////////////////
  FF(100, 305);
  SetFront(25, 200, 'R');
  motorStop();
  delay(120);
  ///////////////////
  FF(100,305);
  SetFront(25, 200, 'R');
  motorStop();
  delay(120);
  /////////////////////
  FF(100, 400);
  SetFront(25, 200, 'R');
  motorStop();
  delay(120);
  
  /////////////////////
  FF(100, 100 );
  SetFront(25);
  DropF();
}