package elrond;

public class Exceptions {
    public static class KnownException extends Exception {
        /**
         *
         */
        private static final long serialVersionUID = 8760300734907152416L;

        public KnownException() {
            super();
        }

        public KnownException(String message) {
            super(message);
        }
    }

    public static class AddressException extends KnownException {

        /**
         *
         */
        private static final long serialVersionUID = 7303569975530215510L;

        public AddressException() {
            super();
        }

        public AddressException(String message) {
            super(message);
        }
    }

    public static class CannotCreateAddressException extends AddressException {
        
        /**
         *
         */
        private static final long serialVersionUID = 1249335179408397539L;
        
        public CannotCreateAddressException(Object input) {
            super(String.format("Cannot create address from: %s", input.toString()));
        }
    }

    public static class BadAddressHrpException extends AddressException {

        /**
         *
         */
        private static final long serialVersionUID = 7074540271315613570L;
    }

    public static class EmptyAddressException extends AddressException{

        /**
         *
         */
        private static final long serialVersionUID = -170346454394596227L;
    }

    public static class CannotConvertBitsException extends AddressException {

        /**
         *
         */
        private static final long serialVersionUID = 7002466269883351644L;
    }

    public static class InvalidCharactersException extends AddressException {

        /**
         *
         */
        private static final long serialVersionUID = 440923894748025560L;
    }

    public static class InconsistentCasingException extends AddressException {

        /**
         *
         */
        private static final long serialVersionUID = -6909226964519236168L;
    }

    public static class MissingAddressHrpException extends AddressException {

        /**
         *
         */
        private static final long serialVersionUID = -2279315088416839103L;
    }

    public static class InvalidAddressChecksumException extends AddressException {

        /**
         *
         */
        private static final long serialVersionUID = 1194101021531173712L;
    }

    public static class CannotGenerateMnemonicException extends KnownException {

        /**
         *
         */
        private static final long serialVersionUID = -9089149758748689110L;
    }

    public static class CannotDeriveKeysException extends KnownException {

        /**
         *
         */
        private static final long serialVersionUID = 6759812280546343157L;
    }

    public static class CannotSerializeTransactionException extends KnownException {

        /**
         *
         */
        private static final long serialVersionUID = -1322742374396410484L;
    }

    public static class CannotSignTransactionException extends KnownException {

        /**
         *
         */
        private static final long serialVersionUID = -5983779627162656410L;
    }

    public static class ProxyRequestException extends KnownException {

        /**
         *
         */
        private static final long serialVersionUID = 1344143859356453293L;

        public ProxyRequestException() {
            super();
        }

        public ProxyRequestException(String message) {
            super(message);
        }
    }
}
