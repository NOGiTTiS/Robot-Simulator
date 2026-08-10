void spinDegree(int relative_degree) {
  int min_speed = 15;                // ความเร็วต่ำสุด
  int max_speed = 100;               // ความเร็วสูงสุด
  float kp = 0.66666;                    // KP
  float kd = 0.1;                    // KD
  float small_angle_threshold = 35;  // หุ่นยนต์จะใช้ความเร็วต่ำสุดเมื่อเข้าใกล้องศาที่กำหนด
  float stop_threshold = 1.2;        // กำหนดความคลาดเคลื่อนที่ยอมรับได้
  unsigned long timer_turn = 0;
  float previous_error = 0;
  float target_degree = current_degree + relative_degree;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  while (1) {
    float current_angle = angleRead(YAW);
    float error = target_degree - current_angle;
    if (error > 180) error -= 360;
    else if (error < -180) error += 360;
    float derivative = error - previous_error;
    int pd_value = (error * kp) + (derivative * kd);
    if (pd_value > max_speed) pd_value = max_speed;
    else if (pd_value < -max_speed) pd_value = -max_speed;
    if (error > stop_threshold && error < small_angle_threshold) {
      motorWrite(min_speed, min_speed, -min_speed, -min_speed);
      timer_turn = millis();
    } else if (error < -stop_threshold && error > -small_angle_threshold) {
      motorWrite(-min_speed, -min_speed, min_speed, min_speed);
      timer_turn = millis();
    } else if (error >= -stop_threshold && error <= stop_threshold) {
      motorStop();
      break;
      // if (millis() - timer_turn >= 10) break;
    } else {
      motorWrite(pd_value, pd_value, -pd_value, -pd_value);
      timer_turn = millis();
    }
    previous_error = error;
  }
}

void LL(float time) {
  // float time = 125;  // เวลาที่ใช้ในการหมุน
  float target_degree = current_degree - 90;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  motorWrite(-100, -100, 100, 100);
  delay(time * power_factor);
  motorStop();
  delay(50);
}

void RR(float time) {
  // float time = 125;  // เวลาที่ใช้ในการหมุน
  float target_degree = current_degree + 90;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  motorWrite(100, 100, -100, -100);
  delay(time * power_factor);
  motorStop();
  delay(50);
}

void TL(float time) {
  // float time = 125;  // เวลาที่ใช้ในการหมุน
  float target_degree = current_degree - 90;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  motorWrite(20, 20, 100, 100);
  delay(time * power_factor);
  motorStop();
}

void TR(float time) {
  // float time = 125;  // เวลาที่ใช้ในการหมุน
  float target_degree = current_degree + 90;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  motorWrite(100, 100, 20, 20);
  delay(time * power_factor);
  motorStop();
}

void TL_B(float time) {
  // float time = 125;  // เวลาที่ใช้ในการหมุน
  float target_degree = current_degree + 90;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  motorWrite(20, 20, -100, -100);
  delay(time * power_factor);
  motorStop();
}

void TR_B(float time) {
  // float time = 125;  // เวลาที่ใช้ในการหมุน
  float target_degree = current_degree - 90;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  motorWrite(-100, -100, 20, 20);
  delay(time * power_factor);
  motorStop();
}

void turnDegreeFront(int relative_degree) {
  int min_speed = 30;                // ความเร็วต่ำสุด
  int max_speed = 100;               // ความเร็วสูงสุด
  float kp = 2.0;                    // KP
  float kd = 0.1;                    // KD
  float small_angle_threshold = 10;  // หุ่นยนต์จะใช้ความเร็วต่ำสุดเมื่อเข้าใกล้องศาที่กำหนด
  float stop_threshold = 2.0;        // กำหนดความคลาดเคลื่อนที่ยอมรับได้
  unsigned long timer_turn = 0;
  float previous_error = 0;
  float target_degree = current_degree + relative_degree;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  while (1) {
    float current_angle = angleRead(YAW);
    float error = target_degree - current_angle;
    if (error > 180) error -= 360;
    else if (error < -180) error += 360;
    float derivative = error - previous_error;
    int pd_value = (error * kp) + (derivative * kd);
    if (pd_value > max_speed) pd_value = max_speed;
    else if (pd_value < -max_speed) pd_value = -max_speed;
    if (error > stop_threshold && error < small_angle_threshold) {
      motorWrite(min_speed, min_speed, 0, 0);
      timer_turn = millis();
    } else if (error < -stop_threshold && error > -small_angle_threshold) {
      motorWrite(0, 0, min_speed, min_speed);
      timer_turn = millis();
    } else if (error >= -stop_threshold && error <= stop_threshold) {
      motorStop();
      break;
      // if (millis() - timer_turn >= 10) break;
    } else {
      if (error <= 0) motorWrite(20, 20, -pd_value, -pd_value);
      else if (error > 0) motorWrite(pd_value, pd_value, 20, 20);
      timer_turn = millis();
    }
    previous_error = error;
  }
}

void turnDegreeBack(int relative_degree) {
  int min_speed = 30;                // ความเร็วต่ำสุด
  int max_speed = 100;               // ความเร็วสูงสุด
  float kp = 2.0;                    // KP
  float kd = 0.1;                    // KD
  float small_angle_threshold = 10;  // หุ่นยนต์จะใช้ความเร็วต่ำสุดเมื่อเข้าใกล้องศาที่กำหนด
  float stop_threshold = 2.0;        // กำหนดความคลาดเคลื่อนที่ยอมรับได้
  unsigned long timer_turn = 0;
  float previous_error = 0;
  float target_degree = current_degree + relative_degree;
  if (target_degree > 180) target_degree -= 360;
  if (target_degree < -180) target_degree += 360;
  current_degree = target_degree;
  while (1) {
    float current_angle = angleRead(YAW);
    float error = target_degree - current_angle;
    if (error > 180) error -= 360;
    else if (error < -180) error += 360;
    float derivative = error - previous_error;
    int pd_value = (error * kp) + (derivative * kd);
    if (pd_value > max_speed) pd_value = max_speed;
    else if (pd_value < -max_speed) pd_value = -max_speed;
    if (error > stop_threshold && error < small_angle_threshold) {
      motorWrite(0, 0, -min_speed, -min_speed);
      timer_turn = millis();
    } else if (error < -stop_threshold && error > -small_angle_threshold) {
      motorWrite(-min_speed, -min_speed, 0, 0);
      timer_turn = millis();
    } else if (error >= -stop_threshold && error <= stop_threshold) {
      motorStop();
      break;
      // if (millis() - timer_turn >= 10) break;
    } else {
      if (error <= 0) motorWrite(pd_value, pd_value, -20, -20);
      else if (error > 0) motorWrite(-20, -20, -pd_value, -pd_value);
      timer_turn = millis();
    }
    previous_error = error;
  }
}