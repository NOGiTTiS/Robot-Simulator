void EndMission() {
  BB(70,335);
  motorStop();
  delay(150);
  spinDegree(90);
  motorStop();
  delay(120);
  SetBack(25);
  ///////////////////
  FF(100, 330);
  motorStop();
  delay(120);
  spinDegree(90);
  motorStop();
  delay(120);
  //////////////////////
  FF(100,190);
  SetFront(25, 210, 'L');
  motorStop();
  delay(120);
  /////////////////////
  FF(100,315);
  SetFront(25, 210, 'L');
  motorStop();
  delay(120);
  SetBack(25);
  motorStop();
  delay(120);
  //////////////////
  FF(100,345);
  motorStop();
  delay(150);
  spinDegree(90);
  motorStop();
  delay(120);
  SetBack(25); 
  motorStop();
  delay(120);
  /////////////////////////
  FF(100,310);
  SetFront(25, 200, 'R');
  motorStop();
  delay(120);
  
  //////////////////////
  FF(100, 185);
  SetFront(25, 200, 'R');
  motorStop();
  delay(120);
  ///////////////////
  FF(100,185);
  SetFront(25, 200, 'L');
  motorStop();
  delay(120);
  //////////////////
  FF(100, 200);
  SetFront(25, 200, 'L');
  motorStop();
  delay(120);
  ////////////////////
  FF(100, 305);
  SetFront(25, 200, 'L');
  motorStop();
  delay(120);
  ///////////////////////
  FF(100, 450);
}