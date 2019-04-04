import time
import datetime
import gpiozero
import sys
import threading

from gpiozero import Buzzer

from . import adxl345
# Connect the Grove Buzzer to digital port D8
# SIG,NC,VCC,GND

# grovepi.pinMode(buzzer,"OUTPUT")

class Tilter:
    def __init__(self):
        self.bz = Buzzer(18)
        self.accel = adxl345.ADXL345()
        self.tick = datetime.datetime.now()
        self.beep_dur = 0.1
        self.sample_period = 0.2
        self.upper = 20
        self.lower = -20
        self.beeping = False
        self.alarm = False
        self.beep_change = datetime.datetime.now()
        self.last_sample = datetime.datetime.now()
        self.run = False
    def update(self):
        now = datetime.datetime.now()
        if (now - self.last_sample) > datetime.timedelta(0, self.sample_period, 0):
            axes = self.accel.getAxes(True)
            self.last_sample = now
            if (axes['x'] > self.upper / 100) or (axes['x'] < self.lower / 100):
                self.alarm = True
            else:
                self.alarm = False
        if self.alarm:
            if (now - self.beep_change) > datetime.timedelta(0, self.beep_dur, 0):
                if self.beeping:
                    self.bz.off()
                    self.beeping = False
                else:
                    self.bz.on()
                    self.beeping = True
                self.beep_change = now
        else:
            self.bz.off()

    def loop(self):
        t = threading.currentThread()
        while getattr(t, "do_run", True):
            try:
                self.update()
                time.sleep(0.01)
            except Exception:
        #        grovepi.digitalWrite(buzzer,0)
                self.bz.off()
                raise
        return

def main():
    t = Tilter()
    t.loop()

if __name__ == "__main__":
    main()
