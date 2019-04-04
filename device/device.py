import pymachine
import signal
import sys
import time
import RPi.GPIO as GPIO  

# for GPIO numbering, choose BCM  
GPIO.setmode(GPIO.BCM)  

def main():
    d = pymachine.Device(device_id="a7xub", private_key="device_key")

    def sigint_handler(signum, frame):
        d.client.disconnect()
        d.stop_tilt()
        print("Bye")
        raise RuntimeError("WTF")
        sys.exit(0)
 
    signal.signal(signal.SIGINT, sigint_handler)
    d.run()

if __name__ == "__main__":
    main()
