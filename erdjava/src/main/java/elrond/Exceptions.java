package elrond;

public class Exceptions {
    public static class ErrKnown extends Exception {
        /**
         *
         */
        private static final long serialVersionUID = 8760300734907152416L;

        public ErrKnown() {
            super();
        }

        public ErrKnown(String message) {
            super(message);
        }
    }

    public static class ErrAddress extends ErrKnown {

        /**
         *
         */
        private static final long serialVersionUID = 7303569975530215510L;

        public ErrAddress() {
            super();
        }

        public ErrAddress(String message) {
            super(message);
        }
    }

    public static class ErrAddressCannotCreate extends ErrAddress {
        
        /**
         *
         */
        private static final long serialVersionUID = 1249335179408397539L;
        
        public ErrAddressCannotCreate(Object input) {
            super(String.format("Cannot create address from: %s", input.toString()));
        }
    }

    public static class ErrAddressBadHrp extends ErrAddress {

        /**
         *
         */
        private static final long serialVersionUID = 7074540271315613570L;
    }

    public static class ErrAddressEmpty extends ErrAddress{

        /**
         *
         */
        private static final long serialVersionUID = -170346454394596227L;
    }

    public static class ErrCannotConvertBits extends ErrAddress {

        /**
         *
         */
        private static final long serialVersionUID = 7002466269883351644L;
    }

    public static class ErrInvalidCharacters extends ErrAddress {

        /**
         *
         */
        private static final long serialVersionUID = 440923894748025560L;
    }

    public static class InconsistentCasingException extends ErrAddress {

        /**
         *
         */
        private static final long serialVersionUID = -6909226964519236168L;
    }

    public static class ErrMissingHrp extends ErrAddress {

        /**
         *
         */
        private static final long serialVersionUID = -2279315088416839103L;
    }

    public static class ErrInvalidChecksum extends ErrAddress {

        /**
         *
         */
        private static final long serialVersionUID = 1194101021531173712L;
    }

    public static class ErrCannotGenerateMnemonic extends ErrKnown {

        /**
         *
         */
        private static final long serialVersionUID = -9089149758748689110L;
    }

    public static class ErrCannotDeriveKeys extends ErrKnown {

        /**
         *
         */
        private static final long serialVersionUID = 6759812280546343157L;

    }
}
