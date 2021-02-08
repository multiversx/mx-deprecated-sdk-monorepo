package mock

type TxSignerStub struct {
	SignMessageCalled     func(msg []byte, skBytes []byte) ([]byte, error)
	GeneratePkBytesCalled func(skBytes []byte) ([]byte, error)
}

func (ts *TxSignerStub) SignMessage(msg []byte, skBytes []byte) ([]byte, error) {
	return ts.SignMessageCalled(msg, skBytes)
}
func (ts *TxSignerStub) GeneratePkBytes(skBytes []byte) ([]byte, error) {
	return ts.GeneratePkBytesCalled(skBytes)
}
func (ts *TxSignerStub) IsInterfaceNil() bool {
	return ts == nil
}
