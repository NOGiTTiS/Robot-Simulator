void Box1() {
  FF(100, 420);
  motorStop();
  delay(120);
  spinDegree(90);
  motorStop();
  delay(120);
  //STOP();
  /////////////////
  FF(100, 285);
  motorStop();
  delay(120);
  spinDegree(90);
  motorStop();
  delay(120);
  /////////////////
  FF(100, 185);
  motorStop();
  delay(120);
  spinDegree(90);
  motorStop();
  delay(120);
  //////////////////
  FF(100, 185);
  motorStop();
  delay(120);
  spinDegree(-90);
  motorStop();
  delay(120);
  FF(100, 250);
  SetFront(25);
  DropF();
}