import tweepy
import json
from tweepy import OAuthHandler
from tweepy import Stream
from tweepy.streaming import StreamListener

import RPi.GPIO as GPIO
import time
import os

from motor import StepperMotor
 
consumer_key = os.environ.get('CONSUMER_KEY', None)
consumer_secret = os.environ.get('CONSUMER_SECRET', None)
access_token = os.environ.get('ACCESS_TOKEN', None)
access_secret = os.environ.get('ACCESS_KEY', None)
 
auth = OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_secret)
 
api = tweepy.API(auth)

class MyListener(StreamListener):
 
    def on_data(self, data):
        try:
            the_tweet = json.loads(data)
            tweet_text = the_tweet['text']
            if tweet_text == 'feed miso':
                print(tweet_text)
                STEP_PIN = 27
                DIR_PIN = 17

                sm = StepperMotor(STEP_PIN, DIR_PIN)
                sm.step_forwards(150) # rotations, 1000 = 2.5 
                sm.step_backwards(150) # rotations, 1000 = 2.5 
            return True
        except BaseException as e:
            print("Error on_data: %s" % str(e))
        return True
 
    def on_error(self, status):
        print(status)
        return True
 
if __name__ == '__main__':
    if (consumer_key is None or access_secret is None or consumer_secret is None or access_token is None):
        print('Error, keys not found')
        exit(1)

    twitter_stream = Stream(auth, MyListener())
    twitter_stream.filter(follow=["834379195820040192"])