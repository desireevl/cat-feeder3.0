# Setup
This part only works on the pi.

You'll need to create a file named `env.sh` with the following contents:

```bash
#!/bin/bash
export INFURA_API_KEY='<API_KEY>'
export ETH_MNEMONIC_KEY='<MNEMONIC_KEY>'

./sendToBlockchain.js
```