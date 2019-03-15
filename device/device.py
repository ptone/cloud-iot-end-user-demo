import pymachine
import time

def democmd(*args, **kwargs):
    print("device got command and handling")
    # print(args)
    # print(kwargs)
    time.sleep(7)
    print("done")
    return "ok"

def main():
    d = pymachine.Device(device_id="pi-test", private_key="device_key")
    d.register_command(democmd)
    d.run()
    



if __name__ == "__main__":
    main()