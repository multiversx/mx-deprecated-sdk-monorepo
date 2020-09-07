package elrond;

public class ErrAddressCannotCreate extends Exception {

    /**
     *
     */
    private static final long serialVersionUID = 1249335179408397539L;
    
    public ErrAddressCannotCreate(Object input) {
        super(String.format("Cannot create address from: %s", input.toString()));
    }
}
