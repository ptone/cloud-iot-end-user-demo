from aiy.enviro import EnviroKit
from aiy.cloudiot import CloudIot
from luma.core.render import canvas
from PIL import ImageDraw
from time import sleep
from PIL import ImageFont

import argparse


def make_font(name, size):
    #  font_path = os.path.abspath(os.path.join(
        #  os.path.dirname(__file__), 'fonts', name))
    #  return ImageFont.truetype(font_path, size)
    return ImageFont.truetype(name, size)



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
    #  update_display(enviro.display, msg)
    font = make_font("code2000.ttf", 36)

    with canvas(enviro.display) as draw:
        #  draw.text((0, 5), msg, fill='white')
        draw.text((1, -5), "hello", fill="white", font=font)
    sleep(10)


if __name__ == '__main__':
    main()
