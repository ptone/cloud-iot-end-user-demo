import datetime
import json
import time
import jwt
import paho.mqtt.client as mqtt

from aiy.enviro import EnviroKit
from aiy.cloudiot import CloudIot
from luma.core.render import canvas
from PIL import ImageDraw, ImageFont
from time import sleep

from . import tilter


# import mqtt_util

from . import mqtt_util

def make_font(name, size):
    #  font_path = os.path.abspath(os.path.join(
        #  os.path.dirname(__file__), 'fonts', name))
    #  return ImageFont.truetype(font_path, size)
    return ImageFont.truetype(name, size)



def update_display(display, msg):
    with canvas(display) as draw:
        draw.text((0, 5), msg, fill='white')

class Device(object):
    def __init__(self, device_id='pi-test', private_key="temp_key"):
        self.registry_id = "end-user-demo"
        self.device_id = device_id
        self.exp = 58
        self.command_handlers = {}
        self.project_id = "iot-end-user-demo"
        self.region = "us-central1"
        self.private_key = private_key
        self._private_key_data = None
        self.key_type = "ES256"
        self.client_id = 'projects/{}/locations/{}/registries/{}/devices/{}'.format(
            self.project_id, self.region, self.registry_id, self.device_id)
        if self._private_key_data == None:
            with open(self.private_key, 'r') as f:
                self._private_key_data = f.read()
        self.debug = False
        self.get_client()
        self.last_publish = datetime.datetime.now()
        self.telemetry_topic = '/devices/{}/events'.format(self.device_id) 
        self.state_topic = '/devices/{}/events/settings'.format(self.device_id) 
        self.enviro = EnviroKit()
        self.claimed = False
        self.tilter = tilter.Tilter()

    def get_client(self):
        self.client = mqtt.Client(client_id=self.client_id, userdata=self)
        # use explicit roots
        # self.client.tls_set(ca_certs="roots.pem")
        # use system CA roots
        self.client.tls_set()
        self.client.max_inflight_messages_set(25)
        self.client.on_connect = mqtt_util.on_connect
        self.client.on_publish = mqtt_util.on_publish
        self.client.on_subscribe = mqtt_util.on_subscribe
        self.client.on_message = mqtt_util.on_message
        self.client.on_disconnect = mqtt_util.on_disconnect
        pw = self.create_jwt()
        self.client.username_pw_set(username='unused', password=pw)
        self.client.connect("mqtt.googleapis.com", port=8883, keepalive=60)
        self.client.subscribe("/devices/{}/config".format(self.device_id), qos=1)
        # self.client.subscribe("/devices/{}/commands/#".format(self.device_id), qos=1)

        self.client.loop_start()
        self.refresh_time = datetime.datetime.utcnow() + datetime.timedelta(minutes=self.exp)

    def create_jwt(self):
        """Create a JWT (https://jwt.io) to establish an MQTT connection.

        Args:
        project_id: The cloud project ID this device belongs to

        private_key_file: A path to a file containing either an RSA256 or ES256
        private key.

        algorithm: The encryption algorithm to use. Either 'RS256' or 'ES256'

        Returns:
        An MQTT generated from the given project_id and private key, which expires
        in 20 minutes. After 20 minutes, your client will be disconnected, and a new
        JWT will have to be generated.

        Raises:
        ValueError: If the private_key_file does not contain a known key.
        """

        token = {
            # The time that the token was issued at
            'iat': datetime.datetime.utcnow(),
            # When this token expires. The device will be disconnected after the token
            # expires, and will have to reconnect.
            'exp': datetime.datetime.utcnow() + datetime.timedelta(minutes=self.exp),
            #  'exp': datetime.datetime.utcnow(),
            # The audience field should always be set to the GCP project id.
            'aud': self.project_id,
            'x-dev': self.device_id,
            'x-reg': self.registry_id
        }
        # Read the private key file.
        with open(self.private_key, 'r') as f:
            private_key = f.read()

        print('Creating JWT using {} from private key file {}'.format(
            self.key_type, self.private_key))

        return jwt.encode(token, self._private_key_data, algorithm=self.key_type)

    def refresh_client(self):
        if self.refresh_time < datetime.datetime.utcnow():
            print ("refreshing client")
            print (datetime.datetime.utcnow())
            #  TODO the disconnect/connect *shouldn't* be needed, but debugging a config push issue
            self.client.disconnect()
            self.get_client()



    def update(self):
        #  check button HW - update internal button state
        #  if button state has changed to down from up, handle_button_press 
        #  update light HW to current logical light state

        if self.debug:
            with open("./mock_%s/button_state" % self.device_id) as b:
                current_button_state = int(b.read())
        else:
            #  current_button_state = GPIO.input(self.button_pin)
            current_button_state = 0
            now = datetime.datetime.now()
            self.tilter.update()
            if self.last_publish < (now - datetime.timedelta(seconds=3)):
                # make sure buzzer isn't latched on during publish, as we are single threaded
                self.tilter.bz.off()
                data = {"temp": self.enviro.temperature, "light": self.enviro.ambient_light}
                print(data)
                if self.claimed:
                    print("publishing")
                    self.client.publish(self.telemetry_topic, json.dumps(data))
                    self.last_publish = now
        #  only reports if state dirty flag set
        # self.report_state()



    def handle_message(self, msg):
        print(msg.payload)
        payload_data = json.loads(msg.payload.decode('utf-8'))
        self.settings = payload_data["setting"]
        font = make_font("code2000.ttf", 36)
        if payload_data["claimed"]:
            self.claimed = True
            with canvas(self.enviro.display) as draw:
                draw.text((1, -5), "hello", fill="white", font=font)
        else:
            self.claimed = False
            with canvas(self.enviro.display) as draw:
                draw.text((1, -5), "bye", fill="white", font=font)

        print(self.settings)
        self.tilter.upper  = self.settings['upper']
        self.tilter.lower = self.settings['lower']
        self.client.publish(self.state_topic, msg.payload)
        print("ok")
        return
        
    def run_step(self):
        #  TODO - the refreshing of the client here can take a second or two
        #  this puts the device offline - what is the right way to avoid?
        #  two clients that slightly overlap in an A/B swap?
        self.refresh_client()
        self.update()

    def run(self):
        #  run the device loop
        while True:
            self.run_step()
            time.sleep(.01)
            #  print "running", self._light, self.state_version
