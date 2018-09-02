import tweepy
from tweepy import OAuthHandler
from tweepy import Stream
from tweepy.streaming import StreamListener
 
consumer_key = 'vMBTb4xE0IHavMLo3XQpqL37y'
consumer_secret = 'R49d2xZkJv7VDIyghGUG4rNByViHLnBH5bgFGz8kUkwgpDkv8v'
access_token = '834379195820040192-qc5JQS1HWxVYZSG9pwccoiFADXBORau'
access_secret = 'a3SGHkC3bD52nOD3o9VVBILImmT8pBe1eXr3SBbWgk5eJ'
 
auth = OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_secret)
 
api = tweepy.API(auth)

def get_last_tweet():
    client = tweepy.API(auth)
    client_id = client.me().id
    tweet = client.user_timeline(id = client_id, count = 1)[0]
    print(tweet.text)

# get_last_tweet()
 


class MyListener(StreamListener):
 
    def on_data(self, data):
        try:
            with open('python.json', 'a') as f:
                f.write(data)
                return True
        except BaseException as e:
            print("Error on_data: %s" % str(e))
        return True
 
    def on_error(self, status):
        print(status)
        return True
 
twitter_stream = Stream(auth, MyListener())
# twitter_stream.filter(track=['#feedmisobreakfast', '#feedmisodinner'])
twitter_stream.filter(follow=["834379195820040192"])