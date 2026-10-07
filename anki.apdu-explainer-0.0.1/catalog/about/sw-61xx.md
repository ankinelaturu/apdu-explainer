## More data available

`xx` is the number of extra bytes. Send GET RESPONSE with Le = `xx`. Do not send a different command first. Typical on T=0 after SELECT FCI or GET DATA.

The instance table above is **this** status word. Other commands may return the same SW in different contexts — read P1/P2 of the command that produced it.
