from aiy.enviro import EnviroKit
from aiy.cloudiot import CloudIot
from luma.core.render import canvas
from PIL import ImageDraw
from time import sleep

import argparse


def update_display(display, msg):
    with canvas(display) as draw:
        draw.text((0, 5), msg, fill='white')


def _none_to_nan(val):
    return float('nan') if val is None else val


def main():
    # Pull arguments from command line.
    parser = argparse.ArgumentParser(description='Enviro Kit Demo')
    parser.add_argument('--display_duration',
                        help='Measurement display duration (seconds)', type=int,
                        default=1)
    parser.add_argument('--upload_delay', help='Cloud upload delay (seconds)',
                        type=int, default=6)
    parser.add_argument('--cloud_config', help='Cloud IoT config file', default='my_config.ini')
    args = parser.parse_args()

    # Create instances of EnviroKit and Cloud IoT.
    enviro = EnviroKit()
    print("kit created")
    with CloudIot(args.cloud_config) as cloud:
        # Indefinitely update display and upload to cloud.
        read_count = 0
        sensors = {}
        while True:
            # First display temperature and RH.
            sensors['temp'] = enviro.temperature
            sensors['humidity'] = enviro.humidity
            msg = 'Temp: %.2f C\n' % _none_to_nan(sensors['temp'])
            msg += 'RH: %.2f %%' % _none_to_nan(sensors['humidity'])
            update_display(enviro.display, msg)
            sleep(args.display_duration)
            # After 5 seconds, switch to light and pressure.
            sensors['light'] = enviro.ambient_light
            sensors['pressure'] = enviro.pressure
            msg = 'Light: %.2f lux\n' % _none_to_nan(sensors['light'])
            msg += 'Pressure: %.2f kPa' % _none_to_nan(sensors['pressure'])
            sleep(args.display_duration)
            read_count += 1
            print(read_count)
            if cloud.enabled():
                print("cloud enabled")
                cloud.publish_message(sensors)
            # If time has elapsed, attempt cloud upload.
            if (read_count > 5):
                update_display(enviro.display, msg)
                read_count = 0


if __name__ == '__main__':
    main()
