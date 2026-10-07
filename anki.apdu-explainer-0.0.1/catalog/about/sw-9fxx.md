## Length xx of response data (GSM SELECT)

Old GSM SELECT: response length is `xx`. Send GET RESPONSE. Not the same as `61 xx`, but you handle it the same way.

The instance table above is **this** status word. Other commands may return the same SW in different contexts — read P1/P2 of the command that produced it.
