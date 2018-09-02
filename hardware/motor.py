import RPi.GPIO as GPIO
import time


class StepperMotor:
    def __init__(self, step_pin, dir_pin, frequency=2000, steps_per_revolution=400):
        """
        GPIO.setup is BCM type

        Args:
            step_pin: Which GPIO port is the step pin using?
            dir_pin: Which GPIO port is the dir pin using?
            frequency: How fast/slow each stop is (in Hz)
            steps_per_revolution: How many steps per revolution.
                                  (360/400 = 0.9 degree / step rotation)
        """
        self.step_pin = step_pin
        self.dir_pin = dir_pin

        self.frequency = frequency
        self.steps_per_revolution = steps_per_revolution

        self._setup()

    def _setup(self):
        """
        Setup GPIO board type and etc
        """
        GPIO.setmode(GPIO.BCM)
        GPIO.setwarnings(False)

        # Configure pins to be output pins
        GPIO.setup(self.step_pin, GPIO.OUT)
        GPIO.setup(self.dir_pin, GPIO.OUT)

    def step_forwards(self, num_steps):
        """
        Steps stepper motor forward num_steps times
        """
        GPIO.output(self.dir_pin, True)
        self._step(num_steps)

    def step_backwards(self, num_steps):
        """
        Steps stepper motor backwards num_steps times
        """
        GPIO.output(self.dir_pin, False)
        self._step(num_steps)

    def step_forwards_degree(self, n_degrees):
        """
        Steps stepper motor forwards n_degrees
        """
        GPIO.output(self.dir_pin, True)
        self._step_degrees(n_degrees)

    def step_backwards_degree(self, n_degrees):
        """
        Steps stepper motor backwards n_degrees
        """
        GPIO.output(self.dir_pin, False)
        self._step_degrees(n_degrees)

    def _step(self, num_steps):
        """
        Steps stepper motor num_step times
        """

        # Multiply by 8 because its 1/8th of a step
        for i in range(num_steps * 8):
            GPIO.output(self.step_pin, True)
            time.sleep(1.0 / self.frequency)
            GPIO.output(self.step_pin, False)
            time.sleep(1.0 / self.frequency)

    def _step_degrees(self, n_degrees):
        """
        Steps stepper motor n_degrees
        """
        num_steps = n_degrees / (360.0 / self.steps_per_revolution)
        self._step(int(num_steps))
        
 
if __name__ == "__main__":
    STEP_PIN = 27
    DIR_PIN = 17
    
    sm = StepperMotor(STEP_PIN, DIR_PIN)
    sm.step_forwards(150) # rotations, 1000 = 2.5 
    sm.step_backwards(150) # rotations, 1000 = 2.5 
