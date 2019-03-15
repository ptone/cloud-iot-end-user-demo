import pymachine
import time

def main():
    d = pymachine.Device(device_id="pi-test", private_key="device_key")
    d.run()
    



if __name__ == "__main__":
    main()