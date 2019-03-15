import datetime
import json

import paho.mqtt.client as mqtt

def error_str(rc):
    """Convert a Paho error to a human readable string."""
    return '{}: {}'.format(rc, mqtt.error_string(rc))



def on_connect(unused_client, unused_userdata, unused_flags, rc):
    """Callback for when a device connects."""
    print('on_connect', error_str(rc))


def on_disconnect(unused_client, unused_userdata, rc):
    """Paho callback for when a device disconnects."""
    print('on_disconnect', error_str(rc))


def on_publish(unused_client, unused_userdata, unused_mid):
    """Paho callback when a message is sent to the broker."""
    print ('on_publish')
    pass

def on_message(unused_client, obj, message):
    try:
        new_state = {}
        #  derp - if you pass the message out, it
        #  converts it to an object??
        #  print(message.payload)
        #  payload_data = json.loads(message.payload)
        #  if topic ends with config - well  - that is easy
        #  as that is the ONLY topic we support...
        obj.handle_message(message)
        #  for k, v in payload_data.iteritems():
            #  print(v)
            #  new_state[k] = convert_value(*v.items()[0])
        print(message.topic)
        print(message.qos)
    except Exception as e:
        print(e)


def on_subscribe(mqttc, obj, mid, granted_qos):
    print("Subscribed: "+str(mid)+" granted: "+str(granted_qos))


