from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User


class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=['customer', 'vendor'])

    class Meta:
        model = User
        fields = ('email', 'password', 'role', 'first_name', 'last_name')

    def create(self, validated_data):
        return User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data['role'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
        )


class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(username=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError('Invalid credentials.')
        if not user.is_active:
            raise serializers.ValidationError('Account is inactive.')
        data['user'] = user
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    role = serializers.CharField(read_only=True)
    email = serializers.EmailField(read_only=True)
    is_approved = serializers.SerializerMethodField()
    vendor_profile_id = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'role', 'first_name', 'last_name', 'is_approved',
                  'vendor_profile_id', 'created_at', 'updated_at')
        read_only_fields = ('id', 'email', 'role', 'created_at', 'updated_at')

    def get_is_approved(self, obj):
        if obj.role != 'vendor':
            return None
        try:
            return obj.vendor_profile.verification_status == 'approved'
        except Exception:
            return False

    def get_vendor_profile_id(self, obj):
        if obj.role != 'vendor':
            return None
        try:
            return str(obj.vendor_profile.id)
        except Exception:
            return None
