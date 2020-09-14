package elrond;

public class Utils {
    public static byte[] toByteArray(int[] input) {
        byte[] result = new byte[input.length];
        for (int i = 0; i < input.length; i++) {
            result[i] = (byte) input[i];
        }
        return result;
    }
}
