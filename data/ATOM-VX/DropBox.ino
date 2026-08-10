void DropF() {
  int speed = 25;
  int speed_track = 50;
  previous_error_forward = 0;
  while (1) {
    readLine();
    if (line_value[1] <= 2 || line_value[2] <= 2) {
      servoWrite(CH_SERVO_FRONT, Servo1_Drop);
      break;
    } else if (line_value[0] >= 3 && line_value[3] >= 3) {
      FF(speed);
    } else if (line_value[0] <= 2 && line_value[3] >= 50) {
      motorWrite(speed_track, speed_track, 0, 0);
      delay(100);
    } else if (line_value[0] >= 50 && line_value[3] <= 2) {
      motorWrite(0, 0, speed_track, speed_track);
      delay(100);
    }
  }
  while (1) {
    readLine();
    FF(speed);
    if (line_value[0] <= 2 && line_value[3] <= 2) {
      motorStop();
      break;
    } else if (line_value[0] <= 2 && line_value[3] >= 50) {
      motorWrite(-speed, -speed, 0, 0);
    } else if (line_value[0] >= 50 && line_value[3] <= 2) {
      motorWrite(0, 0, -speed, -speed);
    }
  }
  delay(150);
  servoWrite(CH_SERVO_FRONT, Servo1_Lock);
}

void DropB() {
  int speed = 25;
  int speed_track = 50;
  previous_error_forward = 0;
  while (1) {
    readLine();
    if (line_value[6] <= 2 || line_value[5] <= 2) {
      servoWrite(CH_SERVO_BACK, Servo0_Drop);
      break;
    } else if (line_value[7] >= 3 && line_value[4] >= 3) {
      BB(speed);
    } else if (line_value[7] <= 2 && line_value[4] >= 50) {
      motorWrite(-speed_track, -speed_track, 0, 0);
      delay(100);
    } else if (line_value[7] >= 50 && line_value[4] <= 2) {
      motorWrite(0, 0, -speed_track, -speed_track);
      delay(100);
    }
  }
  while (1) {
    readLine();
    BB(speed);
    if (line_value[7] <= 2 && line_value[4] <= 2) {
      motorStop();
      break;
    } else if (line_value[7] <= 2 && line_value[4] >= 50) {
      motorWrite(speed, speed, 0, 0);
    } else if (line_value[7] >= 50 && line_value[4] <= 2) {
      motorWrite(0, 0, speed, speed);
    }
  }
  delay(150);
  servoWrite(CH_SERVO_BACK, Servo0_Lock);
}