void Box3() {
  BB(100, 135);
  motorStop();
  delay(120);
  spinDegree(90);
  motorStop();
  delay(120);
  SetBack(25);
  motorStop();
  delay(120);
  ///////////////////////
  FF(100, 335);
  motorStop();
  delay(150);
  spinDegree(90);
  motorStop();
  delay(120);
  SetBack(25);
  motorStop();
  delay(120);
  ///////////////////
  FF(100, 335);
  motorStop();
  delay(120);
  spinDegree(90);
  motorStop();
  delay(120);
  //////////////////
  BB(70, 120);
  SetBack(25); 
  DropB();
  motorStop();
  delay(120);
}